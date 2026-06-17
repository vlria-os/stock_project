package com.example.demo.service;

import com.example.demo.dto.NewsItemResponse;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewsService {

    private static final String HANKYUNG_RSS = "https://rss.hankyung.com/board/finance.xml";

    public List<NewsItemResponse> getMainNews() {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(HANKYUNG_RSS).openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            try (InputStream is = conn.getInputStream()) {
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document doc = builder.parse(is);
                doc.getDocumentElement().normalize();

                NodeList items = doc.getElementsByTagName("item");
                List<NewsItemResponse> result = new ArrayList<>();
                int limit = Math.min(items.getLength(), 5);
                for (int i = 0; i < limit; i++) {
                    Element item = (Element) items.item(i);
                    result.add(new NewsItemResponse(
                        getTagValue("title", item),
                        getTagValue("link", item),
                        getTagValue("pubDate", item),
                        getTagValue("description", item)
                    ));
                }
                return result;
            }
        } catch (Exception e) {
            return List.of();
        }
    }

    private String getTagValue(String tag, Element element) {
        NodeList nodes = element.getElementsByTagName(tag);
        if (nodes.getLength() == 0) return "";
        return nodes.item(0).getTextContent().trim();
    }
}
