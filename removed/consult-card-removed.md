# Removed: consult-card (moved from app/page.tsx and app/globals.css)

## JSX (from app/page.tsx)

```jsx
{
  /* Consult card — overlaps banner */
}
<aside className="consult-card" id="consult-card">
  <div className="consult-card__avatar" aria-hidden="true">
    <i className="fas fa-user-headset consult-card__avatar-icon" />
  </div>
  <h2>{t.consultCard.title}</h2>
  <p className="consult-card__role">{t.consultCard.role}</p>
  <a className="consult-card__primary" href="tel:0962992555">
    {t.consultCard.hotlineLabel} {t.consultCard.hotline}
  </a>
  <a className="consult-card__secondary" href="https://zalo.me/0962992555">
    {t.consultCard.chatZalo}
  </a>
  <p className="consult-card__note">{t.consultCard.note}</p>
</aside>;
```

## CSS (from app/globals.css)

Base styles:

```css
.consult-card {
  justify-self: end;
  width: min(100%, 480px);
  padding: 34px 32px 30px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.consult-card__avatar {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  border-radius: 24px;
  background:
    radial-gradient(circle at 35% 30%, #314757 0%, #0f1820 65%),
    linear-gradient(180deg, #3bb2ff 0%, #0f6d9d 100%);
  border: 5px solid rgba(25, 138, 198, 0.16);
  box-shadow: 0 14px 26px rgba(14, 62, 91, 0.16);
}

.consult-card__avatar-icon {
  color: #eef8fe;
  font-size: 2.35rem;
  text-shadow: 0 10px 18px rgba(6, 18, 24, 0.22);
}

.consult-card h2 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.7rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.consult-card__role {
  margin: 16px 0 28px;
  color: #5f707b;
  font-size: 1.16rem;
}

.consult-card__primary,
.consult-card__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 58px;
  border-radius: 12px;
  font-size: 1.12rem;
  font-weight: 700;
}

.consult-card__primary {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 16px 30px rgba(25, 138, 198, 0.18);
}

.consult-card__secondary {
  margin-top: 14px;
  border: 1px solid rgba(16, 33, 43, 0.14);
  background: #fff;
  color: var(--ink);
}

.consult-card__note {
  margin: 18px 0 0;
  color: #687984;
  font-size: 0.98rem;
}
```

Responsive overrides (copied from globals.css):

```css
/* hero compact override */
.consult-card {
  padding: 18px 16px 18px !important;
}

@media (max-width: 1180px) {
  .consult-card {
    justify-self: start;
  }
}

@media (min-width: 821px) and (max-width: 1180px) {
  .consult-card {
    justify-self: center;
  }
}

@media (max-width: 1000px) {
  .consult-card {
    width: 80%;
    padding: 28px 22px 24px;
  }

  .consult-card__avatar {
    width: 82px;
    height: 82px;
    margin-bottom: 20px;
  }

  .consult-card h2 {
    font-size: 2.1rem;
  }
}

@media (max-width: 1000px) {
  .consult-card {
    justify-self: center;
    width: min(100%, 420px);
    margin: 0 auto;
    padding: 28px 24px 24px;
  }

  .consult-card__avatar {
    width: 72px;
    height: 72px;
    margin-bottom: 18px;
  }

  .consult-card h2 {
    font-size: 1.6rem;
  }
}
```

---

Nếu bạn muốn mình để file này ở định dạng khác (ví dụ `.tsx`/`.css`) hoặc gửi trực tiếp nội dung qua chat, báo mình biết.
