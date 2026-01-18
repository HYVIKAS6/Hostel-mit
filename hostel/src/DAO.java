import java.util.List;

public interface DAO<T> {
    T getById(String id);
    List<T> getAll();
    void save(T t);
    void update(T t);
    void delete(String id);
}
