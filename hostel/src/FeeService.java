
public class FeeService {
    private final FeeDAO feeDAO;

    public FeeService(FeeDAO feeDAO) {
        this.feeDAO = feeDAO;
    }

    public Fee getFeeByStudentId(String studentId) {
        return feeDAO.getFeeByStudentId(studentId);
    }
}
