import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <section className="section">
      <h2>Welcome</h2>
      <p className="mt-2">
        Plan trips with AI, save itineraries, and view them later. Start by{' '}
        <Link className="link" to="/login">logging in</Link>.
      </p>
    </section>
  )
}
