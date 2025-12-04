package com.aurawell.api;

import com.aurawell.models.Product;
import com.aurawell.services.DataManager;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

public class ProductsServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private final DataManager dataManager = DataManager.getInstance();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String category = request.getParameter("category");
        
        List<Product> products;
        if (category != null && !category.isEmpty()) {
            products = dataManager.getProductsByCategory(category);
        } else {
            products = dataManager.getProducts();
        }

        PrintWriter out = response.getWriter();
        out.write(gson.toJson(products));
        out.flush();
    }
}

