import Navbar from "@/components/Navbar";
import styles from "@/styles/Contact.module.css";

export default function Contact() {
  return (
    <>
      <main className={styles.contactMain}>
        <section className={styles.contactSection}>
          <p className={styles.preHeader}>Get In Touch</p>
          <h1>Contact</h1>
          <p className={styles.intro}>
            Have a restaurant recommendation, a question, or just want to share a dining story?
            <br />
            We&apos;d love to hear from you.
          </p>

          <form className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us about your favorite restaurant, or anything on your mind..."
              ></textarea>
            </div>
            <input type="submit" value="Send message" />
          </form>
        </section>
      </main>
    </>
  );
}
