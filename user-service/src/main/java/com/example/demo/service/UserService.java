package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.SignUpRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.kafka.UserProducer;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.jwt.JwtUtil;
import com.example.demo.security.redis.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisService redisService;
    private final UserProducer userProducer;

    //회원가입
    public void signUp(SignUpRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new IllegalStateException("이미 사용 중인 이메일입니다");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();
        userRepository.save(user);

        //kafka 이벤트 발행
        userProducer.sendUserCreated(user.getId());
    }

    //로그인
    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new IllegalStateException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!user.getIsActive()){
            throw new IllegalStateException("탈퇴한 회원입니다");
        }

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new IllegalStateException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());

        String accessToken = jwtUtil.generateToken(claims, 30); //30분
        String refreshToken = jwtUtil.generateToken(claims, 120); //2시간

        redisService.save(user.getId(), refreshToken, 120);
        return new LoginResponse(accessToken, refreshToken);
    }

    //내정보 조회
    public UserResponse getMe(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalStateException("존재하지 않는 회원입니다"));
        return new UserResponse(user);
    }

    //회원탈퇴
    public void withdraw(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new IllegalStateException("존재하지 않는 회원입니다"));
        user.deactivate();
        userRepository.save(user);
        userProducer.sendUserWithdrawn(userId);
    }
}
