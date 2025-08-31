import { SignInWithGoogle, SignOut } from '@/components/AuthButtons';
import { CupUpload } from '@/components/CupUpload';

export default function Home() {
  return (
    <main style={{padding:16}}>
      <h1>AI Καφετζού</h1>
      <SignInWithGoogle /> <SignOut />
      <a href="/my-readings">Μετάβαση στα Readings μου</a>
      <CupUpload />
    </main>
  );
}