export function Footer() {
  return (
    <footer className="w-full p-8 mt-20 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 className="font-bold text-lg mb-2">Contact Us</h3>
          <p>management@bytedocker.com</p>
          <p>+91 99809 36762</p>
        </div>
        <div className="text-center md:text-right">
          <h3 className="font-bold text-lg mb-2">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/bytedocker" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/bytedocker" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  )
}