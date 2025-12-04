package com.aurawell.api;

import com.aurawell.models.Product;
import com.aurawell.services.DataManager;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

public class AdminProductServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        String role = (String) session.getAttribute("userRole");
        return "admin".equals(role);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        PrintWriter out = response.getWriter();

        if (!isAdmin(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Admin access required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Product ID required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String productId = pathInfo.substring(1);

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        JsonObject requestBody = gson.fromJson(sb.toString(), JsonObject.class);
        
        Product product = new Product(
            requestBody.get("name").getAsString(),
            requestBody.get("description").getAsString(),
            requestBody.get("price").getAsDouble(),
            requestBody.get("stock").getAsInt(),
            requestBody.get("category").getAsString(),
            requestBody.get("ageGroup").getAsString(),
            requestBody.has("imageUrl") ? requestBody.get("imageUrl").getAsString() : ""
        );

        Product updatedProduct = dataManager.updateProduct(productId, product);

        if (updatedProduct != null) {
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Product updated successfully");
            jsonResponse.add("product", gson.toJsonTree(updatedProduct));
            out.write(gson.toJson(jsonResponse));
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Product not found");
            out.write(gson.toJson(error));
        }
        out.flush();
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        PrintWriter out = response.getWriter();

        if (!isAdmin(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Admin access required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Product ID required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String productId = pathInfo.substring(1);
        boolean deleted = dataManager.deleteProduct(productId);

        JsonObject jsonResponse = new JsonObject();
        if (deleted) {
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Product deleted successfully");
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("error", "Product not found");
        }

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

