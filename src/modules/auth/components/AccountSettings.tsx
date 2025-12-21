import { useAuth } from '../hooks/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import { useIdentity } from '../hooks/useIdentity'
import { ProfileSection } from './ProfileSection'
import { AccountSection } from './AccountSection'
import { SecuritySection } from './SecuritySection'
import { PreferencesSection } from './PreferencesSection'

export function AccountSettings() {
  const { user, updatePassword, updateEmail } = useAuth()
  const { profile, updateProfile } = useStudentProfile()
  const { type } = useIdentity()

  const isRegistered = type === 'registered'

  return (
    <>
      <ProfileSection
        profile={profile}
        isRegistered={isRegistered}
        onUpdate={updateProfile}
      />

      {isRegistered && (
        <AccountSection
          email={user?.email}
          onUpdateEmail={updateEmail}
        />
      )}

      {isRegistered && (
        <SecuritySection
          onUpdatePassword={updatePassword}
        />
      )}

      <PreferencesSection
        profile={profile}
        onUpdate={updateProfile}
      />
    </>
  )
}
