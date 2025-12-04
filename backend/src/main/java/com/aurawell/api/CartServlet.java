package com.aurawell.api;

import com.aurawell.models.Cart;
import com.aurawell.models.CartItem;
import com.aurawell.models.Product;
import com.aurawell.services.DataManager;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

public class CartServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        PrintWriter out = response.getWriter();

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Not authenticated");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String userId = (String) session.getAttribute("userId");
        Cart cart = dataManager.getCartByUserId(userId);

        // Build response with product details
        JsonObject cartResponse = new JsonObject();
        JsonArray itemsArray = new JsonArray();
        double totalAmount = 0;

        for (CartItem item : cart.getItems()) {
            Product product = dataManager.getProductById(item.getProductId());
            if (product != null) {
                JsonObject itemObj = new JsonObject();
                itemObj.addProperty("productId", item.getProductId());
                itemObj.addProperty("quantity", item.getQuantity());
                itemObj.addProperty("name", product.getName());
                itemObj.addProperty("price", product.getPrice());
                itemObj.addProperty("imageUrl", product.getImageUrl());
                itemObj.addProperty("subtotal", product.getPrice() * item.getQuantity());
                itemsArray.add(itemObj);
                totalAmount += product.getPrice() * item.getQuantity();
            }
        }

        cartResponse.add("items", itemsArray);
        cartResponse.addProperty("totalAmount", totalAmount);
        cartResponse.addProperty("itemCount", cart.getItems().size());

        out.write(gson.toJson(cartResponse));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        PrintWriter out = response.getWriter();

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Not authenticated");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        JsonObject requestBody = gson.fromJson(sb.toString(), JsonObject.class);
        String productId = requestBody.get("productId").getAsString();
        int quantity = requestBody.has("quantity") ? requestBody.get("quantity").getAsInt() : 1;

        String userId = (String) session.getAttribute("userId");
        Cart cart = dataManager.getCartByUserId(userId);

        // Verify product exists
        Product product = dataManager.getProductById(productId);
        if (product == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Product not found");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        cart.addItem(productId, quantity);
        dataManager.updateCart(cart);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Item added to cart");

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        PrintWriter out = response.getWriter();

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Not authenticated");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String userId = (String) session.getAttribute("userId");
        dataManager.clearCart(userId);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Cart cleared");

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

