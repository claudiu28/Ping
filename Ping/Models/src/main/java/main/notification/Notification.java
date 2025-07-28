package main.notification;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import main.generics.BaseEntity;
import main.users.User;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification")
@EqualsAndHashCode(callSuper = true)
public class Notification extends BaseEntity<Long> {

    @Column(name = "text", length = 500, nullable = false)
    private String text;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_notification_user"))
    private User user;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;
}
