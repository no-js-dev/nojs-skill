# Realtime Patterns

Patterns for WebSocket connections, Server-Sent Events (SSE), live updates, notifications, and chat interfaces in No.JS applications.

## Contents

- [Live Polling Dashboard](#live-polling-dashboard)
- [Toast Notifications](#toast-notifications)
- [WebSocket Integration](#websocket-integration)
- [SSE (Server-Sent Events) Live Updates](#sse-live-updates)
- [Live Chat with WebSocket](#live-chat-with-websocket)
- [Live Activity Feed with SSE](#live-activity-feed-with-sse)
- [Theme Switcher (Dark/Light Mode)](#theme-switcher)

---

## When to Use These Patterns

Use realtime patterns when your application needs:

- **Polling** -- periodic auto-refresh of data using `refresh` (simplest approach)
- **WebSocket** -- bidirectional communication for chat, collaborative editing, or live dashboards
- **SSE (Server-Sent Events)** -- server-push for notifications, activity feeds, or status updates (simpler than WebSocket when you only need server-to-client)
- **Toast notifications** -- transient UI messages triggered by events
- **Live updates** -- data that refreshes without user interaction

### Choosing the Right Approach

| Need | Approach | When |
|------|----------|------|
| Periodic data refresh | `refresh` attribute | Data changes infrequently; polling interval is acceptable |
| Server-to-client push | SSE (`EventSource`) | Notifications, feeds, status updates; no client-to-server messaging needed |
| Bidirectional messaging | WebSocket | Chat, collaborative editing, real-time sync |

---

## Live Polling Dashboard

The simplest realtime pattern. Auto-refreshes every 5 seconds using `refresh`. Polling stops when the element disconnects from the DOM:

```html
<div get="/api/status" refresh="5000" as="s">
  <span class-success="s.healthy"
        class-error="!s.healthy"
        bind="s.healthy ? 'Online' : 'Degraded'">
  </span>

  <div each="metric in s.metrics">
    <span bind="metric.label"></span>
    <span bind="metric.value | number"></span>
  </div>
</div>
```

### Polling with Conditional Stop

Stop polling when a condition is met:

```html
<div state="{ pollingActive: true }">
  <div get="/api/job/{jobId}/status" as="job"
       bind-refresh="pollingActive ? 2000 : 0">
    <p bind="'Status: ' + job.status"></p>
    <div class="progress-bar">
      <div class="progress-fill" bind-style:width="job.progress + '%'"></div>
    </div>
    <p show="job.status === 'complete'"
       on:init="pollingActive = false">
      Job complete.
    </p>
  </div>
</div>
```

---

## Toast Notifications

A notification toast system using a global store:

```html
<script>
  NoJS.config({
    stores: {
      toasts: { items: [] }
    }
  });

  // Helper to show toasts from JavaScript
  function showToast(message, type = 'info', duration = 3000) {
    const id = Date.now();
    NoJS.store.toasts.items.push({ id, message, type });
    NoJS.notify();
    setTimeout(() => {
      const idx = NoJS.store.toasts.items.findIndex(t => t.id === id);
      if (idx > -1) NoJS.store.toasts.items.splice(idx, 1);
      NoJS.notify();
    }, duration);
  }
</script>

<!-- Toast container (place at root level) -->
<div class="toast-container">
  <div each="toast in $store.toasts.items" key="toast.id"
       class-toast-info="toast.type === 'info'"
       class-toast-success="toast.type === 'success'"
       class-toast-error="toast.type === 'error'"
       animate-enter="slideInRight"
       animate-leave="fadeOut">
    <span bind="toast.message"></span>
    <button on:click="
      $store.toasts.items.splice($index, 1)
    ">&times;</button>
  </div>
</div>

<!-- Usage from HTML -->
<button on:click="
  $store.toasts.items.push({ id: Date.now(), message: 'Item saved!', type: 'success' })
">Save</button>
```

---

## WebSocket Integration

No.JS does not have a built-in WebSocket directive, but integrating WebSocket with the reactive store system is straightforward. Use `on:init` and `on:unmounted` lifecycle hooks for setup and cleanup, or use the plugin system for app-wide connections.

### Basic WebSocket with Store

Connect a WebSocket on element mount, push messages into a store, and clean up on unmount:

```html
<script>
  NoJS.config({
    stores: {
      ws: { messages: [], connected: false }
    }
  });

  let socket = null;

  function connectWebSocket() {
    socket = new WebSocket('wss://api.myapp.com/ws');

    socket.onopen = () => {
      NoJS.store.ws.connected = true;
      NoJS.notify();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      NoJS.store.ws.messages.push(data);
      // Keep only last 100 messages
      if (NoJS.store.ws.messages.length > 100) {
        NoJS.store.ws.messages.shift();
      }
      NoJS.notify();
    };

    socket.onclose = () => {
      NoJS.store.ws.connected = false;
      NoJS.notify();
      // Auto-reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  function sendMessage(text) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ text, timestamp: Date.now() }));
    }
  }
</script>

<!-- Connect on page load -->
<div on:init="connectWebSocket()" on:unmounted="socket && socket.close()">

  <!-- Connection indicator -->
  <span class-online="$store.ws.connected"
        class-offline="!$store.ws.connected"
        bind="$store.ws.connected ? 'Connected' : 'Disconnected'">
  </span>

  <!-- Message list -->
  <div class="messages">
    <div each="msg in $store.ws.messages" key="msg.timestamp"
         animate-enter="fadeIn">
      <span bind="msg.text"></span>
      <small bind="msg.timestamp | relative"></small>
    </div>
  </div>
</div>
```

### WebSocket as a Plugin

For app-wide WebSocket connections, use the NoJS plugin system with proper lifecycle management:

```html
<script>
  const wsPlugin = {
    name: 'websocket',
    version: '1.0.0',

    install(app) {
      app.global('ws', { connected: false, messages: [] });
    },

    init(app) {
      // DOM is ready — connect
      this._socket = new WebSocket('wss://api.myapp.com/ws');

      this._socket.onopen = () => {
        NoJS.store.ws = { ...NoJS.store.ws, connected: true };
        NoJS.notify();
      };

      this._socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        NoJS.store.ws.messages.push(data);
        NoJS.notify();
      };

      this._socket.onclose = () => {
        NoJS.store.ws = { ...NoJS.store.ws, connected: false };
        NoJS.notify();
      };
    },

    dispose(app) {
      // Cleanup on app teardown
      if (this._socket) {
        this._socket.close();
        this._socket = null;
      }
    }
  };

  NoJS.use(wsPlugin);
</script>

<!-- Use $ws global anywhere in templates -->
<span bind="$ws.connected ? 'Live' : 'Offline'"></span>
<div each="msg in $ws.messages" key="msg.id">
  <span bind="msg.text"></span>
</div>
```

---

## SSE Live Updates

Server-Sent Events provide a simple one-way channel from server to client. Use `EventSource` with `on:init`/`on:unmounted` lifecycle hooks.

### Basic SSE Feed

```html
<script>
  NoJS.config({
    stores: {
      feed: { events: [], connected: false }
    }
  });

  let eventSource = null;

  function connectSSE() {
    eventSource = new EventSource('/api/events/stream');

    eventSource.onopen = () => {
      NoJS.store.feed.connected = true;
      NoJS.notify();
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      NoJS.store.feed.events.unshift(data); // newest first
      // Keep only last 50 events
      if (NoJS.store.feed.events.length > 50) {
        NoJS.store.feed.events.pop();
      }
      NoJS.notify();
    };

    // Listen for specific event types
    eventSource.addEventListener('notification', (event) => {
      const data = JSON.parse(event.data);
      showToast(data.message, data.type || 'info');
    });

    eventSource.onerror = () => {
      NoJS.store.feed.connected = false;
      NoJS.notify();
      // EventSource auto-reconnects by default
    };
  }

  function disconnectSSE() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      NoJS.store.feed.connected = false;
      NoJS.notify();
    }
  }
</script>

<div on:init="connectSSE()" on:unmounted="disconnectSSE()">

  <!-- Connection status -->
  <div class="status-badge"
       class-connected="$store.feed.connected"
       class-disconnected="!$store.feed.connected">
    <span bind="$store.feed.connected ? 'Live' : 'Reconnecting...'"></span>
  </div>

  <!-- Event feed -->
  <div class="event-feed">
    <div if="$store.feed.events.length === 0">
      <p>Waiting for events...</p>
    </div>
    <div each="event in $store.feed.events" key="event.id"
         animate-enter="slideInDown">
      <div class="event-item"
           class-info="event.type === 'info'"
           class-warning="event.type === 'warning'"
           class-error="event.type === 'error'">
        <span bind="event.message"></span>
        <small bind="event.timestamp | relative"></small>
      </div>
    </div>
  </div>
</div>
```

---

## Live Chat with WebSocket

A complete chat interface with WebSocket, message history, and typing indicators:

```html
<script>
  NoJS.config({
    stores: {
      chat: {
        messages: [],
        connected: false,
        typingUsers: []
      }
    }
  });

  let chatSocket = null;
  let typingTimeout = null;

  function connectChat(roomId) {
    chatSocket = new WebSocket('wss://api.myapp.com/chat/' + roomId);

    chatSocket.onopen = () => {
      NoJS.store.chat.connected = true;
      NoJS.notify();
    };

    chatSocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'message') {
        NoJS.store.chat.messages.push(msg);
        NoJS.notify();
      } else if (msg.type === 'typing') {
        if (!NoJS.store.chat.typingUsers.includes(msg.user)) {
          NoJS.store.chat.typingUsers.push(msg.user);
          NoJS.notify();
        }
        // Remove typing indicator after 3s
        setTimeout(() => {
          const idx = NoJS.store.chat.typingUsers.indexOf(msg.user);
          if (idx > -1) {
            NoJS.store.chat.typingUsers.splice(idx, 1);
            NoJS.notify();
          }
        }, 3000);
      }
    };

    chatSocket.onclose = () => {
      NoJS.store.chat.connected = false;
      NoJS.notify();
      setTimeout(() => connectChat(roomId), 3000);
    };
  }

  function sendChatMessage(text) {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN && text.trim()) {
      chatSocket.send(JSON.stringify({
        type: 'message',
        text: text.trim(),
        timestamp: Date.now()
      }));
    }
  }

  function sendTypingIndicator() {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      clearTimeout(typingTimeout);
      chatSocket.send(JSON.stringify({ type: 'typing' }));
    }
  }
</script>

<template route="/chat/:roomId">
  <div class="chat-container"
       on:init="connectChat($route.params.roomId)"
       on:unmounted="chatSocket && chatSocket.close()">

    <!-- Header -->
    <div class="chat-header">
      <h2 bind="'Room: ' + $route.params.roomId"></h2>
      <span class-online="$store.chat.connected"
            bind="$store.chat.connected ? 'Connected' : 'Reconnecting...'">
      </span>
    </div>

    <!-- Messages -->
    <div class="chat-messages">
      <div each="msg in $store.chat.messages" key="msg.timestamp"
           animate-enter="fadeIn">
        <div class="message">
          <strong bind="msg.user"></strong>
          <span bind="msg.text"></span>
          <small bind="msg.timestamp | relative"></small>
        </div>
      </div>
    </div>

    <!-- Typing indicator -->
    <div class="typing-indicator"
         show="$store.chat.typingUsers.length > 0">
      <span bind="$store.chat.typingUsers.join(', ') + ' typing...'"></span>
    </div>

    <!-- Message input -->
    <div state="{ message: '' }" class="chat-input">
      <input model="message" placeholder="Type a message..."
             on:keyup.enter="sendChatMessage(message); message = ''"
             on:input="sendTypingIndicator()" />
      <button on:click="sendChatMessage(message); message = ''"
              bind-disabled="!message.trim() || !$store.chat.connected">
        Send
      </button>
    </div>
  </div>
</template>
```

---

## Live Activity Feed with SSE

A real-time activity feed that shows new events as they arrive from the server, with different event types rendered distinctly:

```html
<script>
  NoJS.config({
    stores: {
      activity: { items: [], unreadCount: 0 }
    }
  });

  let activitySource = null;

  function startActivityFeed() {
    activitySource = new EventSource('/api/activity/stream');

    activitySource.addEventListener('user_action', (event) => {
      const data = JSON.parse(event.data);
      NoJS.store.activity.items.unshift({
        ...data,
        id: Date.now(),
        read: false
      });
      NoJS.store.activity.unreadCount++;
      // Cap at 100 items
      if (NoJS.store.activity.items.length > 100) {
        NoJS.store.activity.items.pop();
      }
      NoJS.notify();
    });

    activitySource.addEventListener('system_alert', (event) => {
      const data = JSON.parse(event.data);
      showToast(data.message, 'warning', 5000);
    });

    activitySource.onerror = () => {
      // EventSource auto-reconnects; update UI if needed
    };
  }

  function stopActivityFeed() {
    if (activitySource) {
      activitySource.close();
      activitySource = null;
    }
  }

  function markAllRead() {
    NoJS.store.activity.items.forEach(item => { item.read = true; });
    NoJS.store.activity.unreadCount = 0;
    NoJS.notify();
  }
</script>

<!-- Notification bell -->
<div class="notification-bell" on:init="startActivityFeed()">
  <button on:click="markAllRead()">
    Notifications
    <span show="$store.activity.unreadCount > 0"
          class="badge"
          bind="$store.activity.unreadCount"></span>
  </button>
</div>

<!-- Activity feed panel -->
<div class="activity-feed">
  <div if="$store.activity.items.length === 0">
    <p class="empty">No recent activity.</p>
  </div>
  <div each="item in $store.activity.items" key="item.id"
       class-unread="!item.read"
       animate-enter="slideInRight">
    <div class="activity-item">
      <strong bind="item.user"></strong>
      <span bind="item.action"></span>
      <span bind="item.target"></span>
      <small bind="item.timestamp | relative"></small>
    </div>
  </div>
</div>
```

---

## Theme Switcher

Dark/light mode toggling via a global store (included here as it commonly accompanies realtime dashboards):

```html
<script>
  // localStorage is safe here — theme preference is non-sensitive data.
  NoJS.config({
    stores: {
      theme: { mode: localStorage.getItem('theme') || 'light' }
    }
  });
</script>

<body class-dark="$store.theme.mode === 'dark'"
      class-light="$store.theme.mode === 'light'">

  <button on:click="
    $store.theme.mode = $store.theme.mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', $store.theme.mode)
  ">
    <span show="$store.theme.mode === 'light'">Switch to Dark Mode</span>
    <span show="$store.theme.mode === 'dark'">Switch to Light Mode</span>
  </button>

</body>
```
