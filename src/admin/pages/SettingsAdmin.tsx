import { useNavigate } from 'react-router-dom';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { auth, logOut } from '../adminFirebase';
import { firebaseConfig } from '../../lib/firebase';
import { Card, PageHeader } from '../ui';

const project = firebaseConfig.projectId;
const consoleLink = (path: string) => `https://console.firebase.google.com/project/${project}/${path}`;

export default function SettingsAdmin() {
  const navigate = useNavigate();
  const email = auth.currentUser?.email ?? firebaseConfig.projectId;

  const signOutNow = async () => {
    await logOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your account and where to manage the rest." />

      <div className="adm-grid two">
        <Card title="Account">
          <ul className="adm-quick">
            <li><span>Signed in as<br /><b>{email}</b></span></li>
            <li><span className="adm-muted">Only this account can open the dashboard.</span></li>
          </ul>
          <button type="button" className="adm-btn" onClick={signOutNow}>
            <ArrowRightStartOnRectangleIcon aria-hidden="true" /> Sign out
          </button>
        </Card>

        <Card title="Manage in Firebase" subtitle="Change your password, users, hosting and more.">
          <ul className="adm-quick">
            <li><span>Users &amp; password</span><a className="adm-link" href={consoleLink('authentication/users')} target="_blank" rel="noopener noreferrer">Open →</a></li>
            <li><span>Database</span><a className="adm-link" href={consoleLink('firestore')} target="_blank" rel="noopener noreferrer">Open →</a></li>
            <li><span>Hosting &amp; domain</span><a className="adm-link" href={consoleLink('hosting')} target="_blank" rel="noopener noreferrer">Open →</a></li>
            <li><span>Google Analytics</span><a className="adm-link" href={consoleLink('analytics')} target="_blank" rel="noopener noreferrer">Open →</a></li>
          </ul>
        </Card>
      </div>

      <Card title="Good to know">
        <ul className="adm-plain">
          <li><b>How quickly changes appear:</b> content you save is stored immediately. Visitors&apos; browsers keep a copy for up to 5 minutes, so it can take a few minutes to show on their side.</li>
          <li><b>Images:</b> pictures you upload are shrunk and stored inside the database, which keeps everything on the free plan. Very large galleries are better added with image links.</li>
          <li><b>Privacy:</b> the site records page views with the page, the referring site, device type, language, country and city. It does not store IP addresses. Your own visits are ignored once you have signed in on a device.</li>
          <li><b>Publishing code changes:</b> run <code>npm run ship</code> to sync SEO, build and deploy.</li>
        </ul>
      </Card>
    </>
  );
}
