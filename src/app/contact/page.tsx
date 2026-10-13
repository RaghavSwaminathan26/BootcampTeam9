import styles from "@/styles/Contact.module.css";

export default function Contact() {
  return (
    <>
      <main className={styles.contactMain}>
        <section className={styles.contactSection}>
          <h1>Contact</h1>

          <form className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="Your message" required></textarea>
            </div>
            <input type="submit" value="Send message" />
          </form>
        </section>
      </main>
    </>
  );
}
