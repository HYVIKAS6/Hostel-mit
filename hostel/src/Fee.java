public class Fee {
    private String studentId;
    private double amount;
    private String date;
    private String transactionId;

    public Fee(String studentId, double amount, String date, String transactionId) {
        this.studentId = studentId;
        this.amount = amount;
        this.date = date;
        this.transactionId = transactionId;
    }

    // Getters and Setters
    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}