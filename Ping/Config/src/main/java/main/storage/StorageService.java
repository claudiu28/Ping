package main.storage;

import lombok.extern.slf4j.Slf4j;
import main.storage.Enums.StorageType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class StorageService {

    private static final String BASE_UPLOAD_DIR = "uploads";
    private static final String POSTS_DIR = "posts";
    private static final String PROFILES_DIR = "profiles";

    public String store(MultipartFile file, StorageType type) {
        try {
            String targetFolder = switch (type) {
                case POSTS -> POSTS_DIR;
                case PROFILES -> PROFILES_DIR;
            };

            Path uploadPath = Paths.get(BASE_UPLOAD_DIR, targetFolder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created directory: {}", uploadPath.toAbsolutePath());
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            log.info("Stored {} file at: {}", type.name().toLowerCase(), filePath.toAbsolutePath());

            return BASE_UPLOAD_DIR + "/" + targetFolder + "/" + filename;

        } catch (Exception ex) {
            log.error("Failed to store file: {}", ex.getMessage(), ex);
            throw new RuntimeException("Could not store file", ex);
        }
    }

    public void delete(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("Deleted file at: {}", filePath);
        } catch (IOException e) {
            log.warn("Could not delete file at {}: {}", filePath, e.getMessage());
        }
    }
}

