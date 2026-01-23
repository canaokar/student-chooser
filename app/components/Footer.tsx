export default function Footer() {
  return (
    <footer className="mt-10 text-center">
      <p className="text-violet-300 text-sm">
        Made by{" "}
        <a
          href="https://github.com/canaokar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-pink-300 transition-colors"
        >
          @canaokar
        </a>
        {" · "}
        <a
          href="https://github.com/canaokar/trainer-tools"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-pink-300 transition-colors"
        >
          View on GitHub
        </a>
      </p>
    </footer>
  );
}
