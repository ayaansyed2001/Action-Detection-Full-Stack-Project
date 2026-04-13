import { useState } from 'react';
import { Activity, ArrowRight, Camera, FolderKanban, Video } from 'lucide-react';

const initialSignupState = {
  username: '',
  email: '',
  password: '',
  confirm_password: '',
};

const initialLoginState = {
  username: '',
  password: '',
};

const signupFieldOrder = ['username', 'email', 'password', 'confirm_password'];
const loginFieldOrder = ['username', 'password'];

function validateSignup(form) {
  const errors = {};

  if (!form.username.trim()) {
    errors.username = 'Username is required.';
  } else if (form.username.trim().length < 3) {
    errors.username = 'Use at least 3 characters.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  }

  if (!form.confirm_password) {
    errors.confirm_password = 'Please confirm your password.';
  } else if (form.confirm_password !== form.password) {
    errors.confirm_password = 'Passwords do not match.';
  }

  return errors;
}

function validateLogin(form) {
  const errors = {};

  if (!form.username.trim()) {
    errors.username = 'Username is required.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function getFeedbackMessage(field, value, error) {
  if (error) {
    return { tone: 'error', text: error };
  }

  if (!value) {
    return null;
  }

  const successMessages = {
    username: 'Username looks good.',
    email: 'Email format looks valid.',
    password: 'Password meets the minimum length.',
    confirm_password: 'Passwords match.',
  };

  if (successMessages[field]) {
    return { tone: 'success', text: successMessages[field] };
  }

  return null;
}

export default function AuthScreen({ onLogin, onSignup, authLoading }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [signupForm, setSignupForm] = useState(initialSignupState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState({});

  const signupErrors = validateSignup(signupForm);
  const loginErrors = validateLogin(loginForm);
  const activeErrors = mode === 'login' ? loginErrors : signupErrors;
  const canSubmit = Object.keys(activeErrors).length === 0;

  const markTouched = (field) => {
    setTouched((current) => ({ ...current, [`${mode}:${field}`]: true }));
  };

  const isTouched = (field) => touched[`${mode}:${field}`];

  const getVisibleFieldError = (field) => (isTouched(field) ? activeErrors[field] : '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fieldOrder = mode === 'login' ? loginFieldOrder : signupFieldOrder;
    const nextTouched = fieldOrder.reduce((accumulator, field) => {
      accumulator[`${mode}:${field}`] = true;
      return accumulator;
    }, {});

    setTouched((current) => ({ ...current, ...nextTouched }));

    if (!canSubmit) {
      setError('Please fix the highlighted fields before continuing.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        await onLogin(loginForm);
      } else {
        await onSignup(signupForm);
        setLoginForm({ username: signupForm.username.trim(), password: '' });
        setSignupForm(initialSignupState);
        setTouched({});
        setMode('login');
        setSuccessMessage('Account created successfully. Please log in to continue.');
      }
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="app-background">
        <div className="app-orb app-orb-primary" />
        <div className="app-orb app-orb-secondary" />
        <div className="app-grid" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="auth-layout w-full overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 shadow-[0_30px_120px_rgba(2,8,23,0.6)] backdrop-blur-2xl">
          <div className="auth-panel auth-panel--brand">
            <div className="brand-mark">
              <Activity className="h-6 w-6" />
            </div>
            <p className="eyebrow mt-6">Secure access</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Access the action detection workspace that runs your uploads.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Create an account to upload clips, launch action analysis, and revisit each processed detection timeline
              from one protected dashboard.
            </p>
            <div className="mt-8 space-y-4 text-sm text-slate-200">
                <div className="auth-feature-card">
                  <Video className="h-5 w-5 text-cyan-300" />
                  Upload recorded clips and keep every analysis session in one workspace
                </div>
                <div className="auth-feature-card">
                  <Camera className="h-5 w-5 text-fuchsia-300" />
                  Switch between file uploads and webcam capture for faster action reviews
                </div>
                <div className="auth-feature-card">
                  <FolderKanban className="h-5 w-5 text-emerald-300" />
                  Review processed videos, timestamps, and confidence scores from the dashboard
                </div>
            </div>
          </div>

          <div className="auth-panel auth-panel--form">
            <div className="auth-switcher">
              <button
                type="button"
                className={`auth-switcher__button ${mode === 'login' ? 'auth-switcher__button--active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMessage('');
                  setTouched({});
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-switcher__button ${mode === 'signup' ? 'auth-switcher__button--active' : ''}`}
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccessMessage('');
                  setTouched({});
                }}
              >
                Signup
              </button>
            </div>

            <div className="mt-8">
              <p className="panel-kicker">{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {mode === 'login' ? 'Resume your detection dashboard' : 'Start tracking detections securely'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {mode === 'login'
                  ? 'Open your workspace to continue reviewing uploaded videos and recent detection activity.'
                  : 'Create your workspace to start uploading clips, running detections, and tracking results.'}
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <label className="auth-field">
                    <span className="auth-field__label">Username</span>
                    <input
                      className={`auth-input ${getVisibleFieldError('username') ? 'auth-input--error' : ''}`}
                      value={signupForm.username}
                      onBlur={() => markTouched('username')}
                      onChange={(event) => {
                        setSignupForm((current) => ({ ...current, username: event.target.value }));
                        setError('');
                      }}
                      placeholder="Choose a username"
                      required
                    />
                    {isTouched('username') && (
                      <FieldFeedback feedback={getFeedbackMessage('username', signupForm.username.trim(), signupErrors.username)} />
                    )}
                  </label>
                  <label className="auth-field">
                    <span className="auth-field__label">Email</span>
                    <input
                      className={`auth-input ${getVisibleFieldError('email') ? 'auth-input--error' : ''}`}
                      type="email"
                      value={signupForm.email}
                      onBlur={() => markTouched('email')}
                      onChange={(event) => {
                        setSignupForm((current) => ({ ...current, email: event.target.value }));
                        setError('');
                      }}
                      placeholder="name@example.com"
                      required
                    />
                    {isTouched('email') && (
                      <FieldFeedback feedback={getFeedbackMessage('email', signupForm.email.trim(), signupErrors.email)} />
                    )}
                  </label>
                  <label className="auth-field">
                    <span className="auth-field__label">Password</span>
                    <input
                      className={`auth-input ${getVisibleFieldError('password') ? 'auth-input--error' : ''}`}
                      type="password"
                      value={signupForm.password}
                      onBlur={() => markTouched('password')}
                      onChange={(event) => {
                        setSignupForm((current) => ({ ...current, password: event.target.value }));
                        setError('');
                      }}
                      placeholder="Minimum 8 characters"
                      required
                    />
                    {isTouched('password') && (
                      <FieldFeedback feedback={getFeedbackMessage('password', signupForm.password, signupErrors.password)} />
                    )}
                  </label>
                  <label className="auth-field">
                    <span className="auth-field__label">Confirm password</span>
                    <input
                      className={`auth-input ${getVisibleFieldError('confirm_password') ? 'auth-input--error' : ''}`}
                      type="password"
                      value={signupForm.confirm_password}
                      onBlur={() => markTouched('confirm_password')}
                      onChange={(event) => {
                        setSignupForm((current) => ({ ...current, confirm_password: event.target.value }));
                        setError('');
                      }}
                      placeholder="Repeat your password"
                      required
                    />
                    {isTouched('confirm_password') && (
                      <FieldFeedback
                        feedback={getFeedbackMessage(
                          'confirm_password',
                          signupForm.confirm_password,
                          signupErrors.confirm_password,
                        )}
                      />
                    )}
                  </label>
                </>
              )}

              {mode === 'login' && (
                <>
                  <label className="auth-field">
                    <span className="auth-field__label">Username</span>
                    <input
                      className={`auth-input ${getVisibleFieldError('username') ? 'auth-input--error' : ''}`}
                      value={loginForm.username}
                      onBlur={() => markTouched('username')}
                      onChange={(event) => {
                        setLoginForm((current) => ({ ...current, username: event.target.value }));
                        setError('');
                      }}
                      placeholder="Enter your username"
                      required
                    />
                    {isTouched('username') && (
                      <FieldFeedback feedback={getFeedbackMessage('username', loginForm.username.trim(), loginErrors.username)} />
                    )}
                  </label>
                  <label className="auth-field">
                    <span className="auth-field__label">Password</span>
                    <input
                      className={`auth-input ${getVisibleFieldError('password') ? 'auth-input--error' : ''}`}
                      type="password"
                      value={loginForm.password}
                      onBlur={() => markTouched('password')}
                      onChange={(event) => {
                        setLoginForm((current) => ({ ...current, password: event.target.value }));
                        setError('');
                      }}
                      placeholder="Enter your password"
                      required
                    />
                    {isTouched('password') && (
                      <FieldFeedback
                        feedback={
                          loginErrors.password
                            ? getFeedbackMessage('password', loginForm.password, loginErrors.password)
                            : { tone: 'success', text: 'Password entered. Ready to authenticate.' }
                        }
                      />
                    )}
                  </label>
                </>
              )}

              {successMessage && <p className="auth-success">{successMessage}</p>}
              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="primary-button w-full justify-center"
                disabled={submitting || authLoading || !canSubmit}
              >
                {submitting || authLoading ? (
                  'Please wait...'
                ) : mode === 'login' ? (
                  <>
                    Login
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function FieldFeedback({ feedback }) {
  if (!feedback) {
    return null;
  }

  return <p className={`auth-feedback auth-feedback--${feedback.tone}`}>{feedback.text}</p>;
}
