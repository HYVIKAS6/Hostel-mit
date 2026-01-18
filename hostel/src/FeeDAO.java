import java.util.ArrayList;
import java.util.List;

public class FeeDAO implements DAO<Fee> {
    private static final String FILE_PATH = "data/fees.csv";

    @Override
    public Fee getById(String id) {
        // In this context, 'id' is the transactionId
        List<Fee> fees = getAll();
        for (Fee fee : fees) {
            if (fee.getTransactionId().equals(id)) {
                return fee;
            }
        }
        return null;
    }

    @Override
    public List<Fee> getAll() {
        List<Fee> fees = new ArrayList<>();
        List<String[]> records = DataStorage.readData(FILE_PATH);
        // Skip header
        for (int i = 1; i < records.size(); i++) {
            String[] record = records.get(i);
            fees.add(new Fee(record[0], Double.parseDouble(record[1]), record[2], record[3]));
        }
        return fees;
    }

    @Override
    public void save(Fee fee) {
        List<Fee> fees = getAll();
        fees.add(fee);
        writeAll(fees);
    }

    @Override
    public void update(Fee fee) {
        List<Fee> fees = getAll();
        for (int i = 0; i < fees.size(); i++) {
            if (fees.get(i).getTransactionId().equals(fee.getTransactionId())) {
                fees.set(i, fee);
                break;
            }
        }
        writeAll(fees);
    }

    @Override
    public void delete(String id) {
        // 'id' is the transactionId
        List<Fee> fees = getAll();
        fees.removeIf(fee -> fee.getTransactionId().equals(id));
        writeAll(fees);
    }

    private void writeAll(List<Fee> fees) {
        List<String[]> records = new ArrayList<>();
        records.add(new String[]{"studentId", "amount", "date", "transactionId"}); // Header
        for (Fee f : fees) {
            records.add(new String[]{f.getStudentId(), String.valueOf(f.getAmount()), f.getDate(), f.getTransactionId()});
        }
        DataStorage.writeData(FILE_PATH, records);
    }
}