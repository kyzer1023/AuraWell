package com.aurawell.api;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@MultipartConfig(
    fileSizeThreshold = 1024 * 1024,      // 1 MB
    maxFileSize = 1024 * 1024 * 10,        // 10 MB
    maxRequestSize = 1024 * 1024 * 15      // 15 MB
)
public class ImageUploadServlet extends HttpServlet {
    private static final Gson gson = new Gson();
    private static final String UPLOAD_DIR = "uploads/products";
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        String role = (String) session.getAttribute("userRole");
        return "admin".equals(role);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) return "";
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot).toLowerCase() : "";
    }

    private boolean isAllowedExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equals(extension)) return true;
        }
        return false;
    }

    private String getUploadPath() {
        // Get the directory where the application is running
        String basePath = System.getProperty("user.dir");
        return basePath + File.separator + UPLOAD_DIR;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check admin access
        if (!isAdmin(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Admin access required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        try {
            Part filePart = request.getPart("image");
            
            if (filePart == null || filePart.getSize() == 0) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                JsonObject error = new JsonObject();
                error.addProperty("error", "No image file provided");
                out.write(gson.toJson(error));
                out.flush();
                return;
            }

            String originalFileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
            String extension = getFileExtension(originalFileName);

            if (!isAllowedExtension(extension)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                JsonObject error = new JsonObject();
                error.addProperty("error", "Invalid file type. Allowed: jpg, jpeg, png, gif, webp");
                out.write(gson.toJson(error));
                out.flush();
                return;
            }

            // Generate unique filename
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            
            // Create upload directory if it doesn't exist
            String uploadPath = getUploadPath();
            Path uploadDir = Paths.get(uploadPath);
            Files.createDirectories(uploadDir);

            // Save the file
            Path filePath = uploadDir.resolve(uniqueFileName);
            try (InputStream input = filePart.getInputStream()) {
                Files.copy(input, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return the URL path that frontend will use
            String imageUrl = "/api/images/" + uniqueFileName;

            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Image uploaded successfully");
            jsonResponse.addProperty("imageUrl", imageUrl);
            jsonResponse.addProperty("fileName", uniqueFileName);

            out.write(gson.toJson(jsonResponse));
            out.flush();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Failed to upload image: " + e.getMessage());
            out.write(gson.toJson(error));
            out.flush();
        }
    }
}

