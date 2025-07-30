# 📱 Social Media App – Full Stack (Backend + Frontend)

Un proiect complet de social media, construit cu **Spring Boot + Kafka + WebSocket** pe backend și **Next.js + WebSocket + REST API** pe frontend.

## 🛠️ Tehnologii Folosite

### Backend (Java + Spring Boot)
- Spring Security + JWT
- WebSocket (STOMP/SockJS)
- Apache Kafka (evenimente: postare, comentariu, cerere prietenie)
- PostgreSQL / JPA / Hibernate
- REST API (Documentat în controllere)
- Upload imagini (StorageService)
- Logare: SLF4J

### Frontend (React / Next.js)
- React 18 + Next.js 14 (App Router)
- TypeScript + TailwindCSS + ShadCN UI
- WebSocket pentru mesagerie și notificări live
- React Query + Axios (gestionare requesturi)
- Formulare cu react-hook-form + zod
- JWT gestionat cu cookies-next

---

## 🔐 Autentificare
- Register / Login (cu JWT)
- Resetare parolă prin SMS
- Verificare cod prin endpoint dedicat
- Condiționare interfețe pe roluri (Admin/User)

---

## 💬 Funcționalități Backend

### ✅ Chat și mesaje
| Endpoint | Metodă | Descriere |
|---------|--------|----------|
| `/api/chat/user1/{username1}/user2/{username2}/private/{chatName}` | POST | Creează conversație privată |
| `/api/chat/group/{groupName}` | POST | Creează conversație de grup |
| `/api/chat/conversation/{id}` | POST | Trimite mesaj (trimite și WS) |
| `/api/chat/conversation/{id}/details` | GET | Returnează toate mesajele dintr-o conversație |
| `/api/chat/conversation/user?username=...` | GET | Returnează toate conversațiile unui user |

### ✅ Notificări
| Endpoint | Metodă | Descriere |
|----------|--------|-----------|
| `/api/notification/unread?username=...` | GET | Notificări necitite |
| `/api/notification/all?username=...` | GET | Toate notificările |
| `/api/notification/mark-as-read?notificationId=...` | PATCH | Marchează ca citit |
| `/api/notification/{id}` | DELETE | Șterge notificare |

**📡 Kafka Topics:**
- `post-add-event` → notifică prietenii despre o postare nouă
- `comment-event` → notifică autorul postării despre comentarii
- `friend-request-event` → notifică userii despre cereri de prietenie

**🔔 WebSocket Channels:**
- `/topic/conversations/{conversationId}` – mesaje în timp real
- `/topic/notifications/{username}` – notificări în timp real

---

## 👤 Funcționalități Profil
| Endpoint | Metodă | Descriere |
|----------|--------|-----------|
| `/api/user/update-info` | PATCH | Actualizează datele (nume, bio, telefon) |
| `/api/user/upload-picture` | POST | Upload imagine profil (multipart) |
| `/api/user/delete-picture` | POST | Șterge poza de profil |
| `/api/user/username?username=...` | GET | Caută user după username |
| `/api/user/search?keyword=...` | GET | Caută useri după keyword |

🔄 Orice actualizare de profil este transmisă în timp real prin `/topic/update-picture/{username}` și `/topic/update-info/{username}`

---

## 🎨 Frontend – Paginile principale (Next.js)

- `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
- `/social` – Pagina principală (cu Tabs: Feed, Friends, Chat, Profile)
- `FeedTab.tsx` – afisează postările
- `ChatTab.tsx` – conversații & mesagerie live (WebSocket)
- `FriendsTab.tsx` – sugestii, cereri, prieteni actuali
- `ProfileTab.tsx` – editezi profilul, vezi postările proprii
- `NotificationsDialog.tsx` – afișează notificările live

