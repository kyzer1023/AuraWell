package com.aurawell.models;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Order {
    private String id;
    private String userId;
    private List<OrderItem> items;
    private double totalAmount;
    private String status; // "pending", "processing", "shipped", "delivered", "cancelled"
    private String shippingAddress;
    private long createdAt;

    public Order() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = System.currentTimeMillis();
        this.status = "pending";
        this.items = new ArrayList<>();
    }

    public Order(String userId, List<OrderItem> items, double totalAmount, String shippingAddress) {
        this();
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}

