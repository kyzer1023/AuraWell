package com.aurawell.api;

import com.aurawell.models.Product;
import com.aurawell.services.DataManager;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class ProductServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();

        if (pathInfo == null || pathInfo.equals("/")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Product ID required");
            out.write(gson.toJson(error));
            out.flush();
            return;
        }

        String productId = pathInfo.substring(1);
        Product product = dataManager.getProductById(productId);

        if (product != null) {
            out.write(gson.toJson(product));
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            JsonObject error = new JsonObject();
            error.addProperty("error", "Product not found");
            out.write(gson.toJson(error));
        }
        out.flush();
    }
}

