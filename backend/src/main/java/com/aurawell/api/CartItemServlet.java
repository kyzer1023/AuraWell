package com.aurawell.api;

import com.aurawell.models.Cart;
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

public class CartItemServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
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
        int quantity = requestBody.get("quantity").getAsInt();

        String userId = (String) session.getAttribute("userId");
        Cart cart = dataManager.getCartByUserId(userId);
        cart.updateItem(productId, quantity);
        dataManager.updateCart(cart);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Cart updated");

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
        String userId = (String) session.getAttribute("userId");
        Cart cart = dataManager.getCartByUserId(userId);
        cart.removeItem(productId);
        dataManager.updateCart(cart);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Item removed from cart");

        out.write(gson.toJson(jsonResponse));
        out.flush();
    }
}

