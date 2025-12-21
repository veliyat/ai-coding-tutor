import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu'
import { Avatar } from '@/shared/components/Avatar'
import { useAuth, useAccessCode, useIdentity } from '@/modules/auth'
import logo from '@/assets/logo.png'

export function Header() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { clearAccessCode } = useAccessCode()
  const { type, displayName, avatar, accessCode } = useIdentity()

  async function handleSignOut() {
    if (type === 'registered') {
      await signOut()
    } else {
      clearAccessCode()
    }
    navigate('/')
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/learn" className="flex flex-col items-center gap-1">
          <img src={logo} alt="AI Coding Tutor" className="h-4 w-auto mt-2" />
          <span className="text-xs">AI Coding Tutor</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Display name */}
          {displayName && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {displayName}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer outline-none flex items-center gap-1">
              <Avatar emoji={avatar} size="sm" />
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Code-based user menu */}
              {type === 'code_based' && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Code: {accessCode}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Inactive profiles are deleted after 10 days.
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/signup">Register for permanent access</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Registered user menu */}
              {type === 'registered' && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <span className="font-medium">{displayName}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={handleSignOut}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
