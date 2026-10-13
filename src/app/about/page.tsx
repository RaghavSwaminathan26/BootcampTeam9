import styles from "@/styles/About.module.css";

export default function About() {
  return (
    <main className={styles.aboutMain}>
      <h1>About</h1>
      <div className={styles.aboutSection}>
        <section>
          <p>
            This project was developed as part of the Hack4Impact bootcamp. Our web app is designed to allow users to
            log restaurants they have visited or want to visit. For each restaurant, users can add the name, location,
            and the cuisine type. Optionally, users can add ratings for restaurants they have visited and the home page
            will list the restaurants in order of the highest rating to the lowest rating. Additionally, the Tasting
            Atlas allows users to unlock achievements based on the restaurants they have visited. If a user unlocks all
            the achievements of a path, they will recieve an award (e.g. a coupon). This provides an incentive for users
            to visit more restaurants and generate more traffic for our app. Ultimately, the design of this web app
            benefits restaurant owners, users, and the community by encouraging users to explore new restaurants and for
            restaurant owners to attract new customers.
          </p>
        </section>
      </div>
    </main>
  );
}
