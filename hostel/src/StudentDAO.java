
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class StudentDAO implements DAO<Student> {

    public Student login(String username, String password) {
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.STUDENTS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 5) {
                    if (parts[2].equals(username) && parts[3].equals(password)) {
                        return new Student(Integer.parseInt(parts[0]), parts[1], parts[2], parts[3], parts[4]);
                    }
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.err.println("Login failed: " + e.getMessage());
        }
        return null;
    }

    public Student createStudent(String name, String username, String password, String contact) {
        int newId = getNextId();
        Student student = new Student(newId, name, username, password, contact);
        save(student);
        return student;
    }

    @Override
    public Student getById(String id) {
        try {
            int studentId = Integer.parseInt(id);
            return getStudentById(studentId);
        } catch (NumberFormatException e) {
            System.err.println("Invalid student ID format: " + e.getMessage());
            return null;
        }
    }

    public Student getStudentById(int studentId) {
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.STUDENTS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 5 && Integer.parseInt(parts[0]) == studentId) {
                    return new Student(Integer.parseInt(parts[0]), parts[1], parts[2], parts[3], parts[4]);
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error getting student by ID: " + e.getMessage());
        }
        return null;
    }

    @Override
    public List<Student> getAll() {
        List<Student> students = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.STUDENTS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 5) {
                    students.add(new Student(Integer.parseInt(parts[0]), parts[1], parts[2], parts[3], parts[4]));
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error getting students: " + e.getMessage());
        }
        return students;
    }

    @Override
    public void save(Student student) {
        try (FileWriter writer = new FileWriter(DataStorage.STUDENTS_FILE, true)) {
            writer.write(String.format("%d,%s,%s,%s,%s\n", student.getId(), student.getName(), student.getUsername(), student.getPassword(), student.getContact()));
        } catch (IOException e) {
            System.err.println("Error creating student: " + e.getMessage());
        }
    }

    @Override
    public void update(Student student) {
        System.out.println("Update method is not implemented yet.");
        // To implement update, you would read all students into a list,
        // find the student to update, replace it, and then rewrite the entire file.
    }

    @Override
    public void delete(String id) {
         try {
            int studentId = Integer.parseInt(id);
            deleteStudentById(studentId);
        } catch (NumberFormatException e) {
            System.err.println("Invalid student ID format: " + e.getMessage());
        }
    }

    private int getNextId() {
        int maxId = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.STUDENTS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length > 0) {
                    try {
                        int id = Integer.parseInt(parts[0]);
                        if (id > maxId) {
                            maxId = id;
                        }
                    } catch (NumberFormatException e) {
                        // Ignore lines with invalid id
                    }
                }
            }
        } catch (IOException e) {
            // Ignore if file doesn't exist yet
        }
        return maxId + 1;
    }

    public boolean deleteStudentById(int studentId) {
        List<String> lines = new ArrayList<>();
        boolean found = false;

        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.STUDENTS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length > 0) {
                    if (Integer.parseInt(parts[0]) == studentId) {
                        found = true;
                        // Skip this line
                    } else {
                        lines.add(line);
                    }
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error reading students for deletion: " + e.getMessage());
            return false;
        }

        if (found) {
            try (FileWriter writer = new FileWriter(DataStorage.STUDENTS_FILE, false)) { // Overwrite
                for (String line : lines) {
                    writer.write(line + "\n");
                }
                return true;
            } catch (IOException e) {
                System.err.println("Error writing students after deletion: " + e.getMessage());
                return false;
            }
        }

        return false; // Student not found
    }

    public List<String> getAllStudentsWithAllocationDetails() {
        List<String> studentDetails = new ArrayList<>();
        List<Student> students = getAll();

        for (Student student : students) {
            String allocationInfo = getAllocationInfoForStudent(student.getId());
            studentDetails.add(String.format("ID: %d, Name: %s, %s", student.getId(), student.getName(), allocationInfo));
        }
        return studentDetails;
    }

    private String getAllocationInfoForStudent(int studentId) {
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.ALLOCATIONS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 4 && Integer.parseInt(parts[1]) == studentId) {
                    int roomId = Integer.parseInt(parts[2]);
                    String roomNumber = getRoomNumberById(roomId);
                    return "Room: " + roomNumber;
                }
            }
        } catch (IOException | NumberFormatException e) {
            // Error reading file or no allocation found
        }
        return "Room: Not Allocated";
    }

    private String getRoomNumberById(int roomId) {
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.ROOMS_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length > 1 && Integer.parseInt(parts[0]) == roomId) {
                    return parts[1]; // room_number
                }
            }
        } catch (IOException | NumberFormatException e) {
            // ignore
        }
        return "Unknown";
    }

    public int getStudentCount() {
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(DataStorage.STUDENTS_FILE))) {
            while (reader.readLine() != null) {
                count++;
            }
        } catch (IOException e) {
            System.err.println("Error counting students: " + e.getMessage());
        }
        return count;
    }
}
