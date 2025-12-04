package com.aurawell.api;

import com.aurawell.models.*;
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
import java.util.ArrayList;
import java.util.List;

public class OrdersServlet extends HttpServlet {
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
        List<Order> orders = dataManager.getOrdersByUserId(userId);

        out.write(gson.toJson(orders));
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
        String shippingAddress = requestBody.get("shippingAddress").getAsString();

        String userId = (String) session.getAttribute("userId");
        Cart cart = dataManager.getCartByUserId(userId);

        if (cart.getItems().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Cart is empty");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        // Create order items from cart
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = dataManager.getProductById(cartItem.getProductId());
            if (product != null) {
                OrderItem orderItem = new OrderItem(
                    product.getId(),
                    product.getName(),
                    cartItem.getQuantity(),
                    product.getPrice()
                );
                orderItems.add(orderItem);
                totalAmount += product.getPrice() * cartItem.getQuantity();

                // Update stock
                product.setStock(product.getStock() - cartItem.getQuantity());
                dataManager.updateProduct(product.getId(), product);
            }
        }

        // Create order
        Order order = new Order(userId, orderItems, totalAmount, shippingAddress);
        dataManager.createOrder(order);

        // Clear cart
        dataManager.clearCart(userId);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Order placed successfully");
        jsonResponse.addProperty("orderId", order.getId());
        jsonResponse.addProperty("totalAmount", totalAmount);

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

