package com.aurawell.api;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class ImageServlet extends HttpServlet {
    private static final String UPLOAD_DIR = "uploads/products";

    private String getUploadPath() {
        String basePath = System.getProperty("user.dir");
        return basePath + File.separator + UPLOAD_DIR;
    }

    private String getContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Get the image filename from the URL path
        String pathInfo = request.getPathInfo();
        
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Image filename required");
            return;
        }

        // Remove leading slash
        String fileName = pathInfo.substring(1);
        
        // Security: prevent directory traversal attacks
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Invalid filename");
            return;
        }

        Path imagePath = Paths.get(getUploadPath(), fileName);
        File imageFile = imagePath.toFile();

        if (!imageFile.exists() || !imageFile.isFile()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("Image not found");
            return;
        }

        // Set content type based on file extension
        String contentType = getContentType(fileName);
        response.setContentType(contentType);
        response.setContentLength((int) imageFile.length());
        
        // Set cache headers for better performance
        response.setHeader("Cache-Control", "public, max-age=86400"); // 1 day cache

        // Stream the image file to the response
        try (OutputStream out = response.getOutputStream()) {
            Files.copy(imagePath, out);
            out.flush();
        }
    }
}

