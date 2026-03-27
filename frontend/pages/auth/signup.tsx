import AuthForm from '../../components/AuthForm';
import Layout from '../../components/Layout';
import axios from 'axios';

export default function SignupPage() {
  const handleSignup = async (data: any) => {
    try {
      const response = await axios.post('/api/auth/signup', data);
      alert('Signup successful! Please log in.');
      window.location.href = '/auth/login';
    } catch (err: any) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center py-12">
        <AuthForm type="signup" onSubmit={handleSignup} />
      </div>
    </Layout>
  );
}
