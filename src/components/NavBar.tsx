import {
  BookOpenIcon,
  CreditCardIcon,
  GraduationCap,
  LogInIcon,
  LogOutIcon,
  UserPlus2Icon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-background border-b">
      <Link
        href={"/"}
        className="text-xl font-extrabold text-primary flex items-center gap-2"
      >
        MasterClass <GraduationCap className="size-6" />
      </Link>

      <div className="flex items-center space-x-1 sm:space-x-4">
        <Link
          href={"/courses"}
          className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        >
          <BookOpenIcon className="size-4" />
          <span className="hidden sm:inline">Courses</span>
        </Link>

        <Link
          href={"/pro"}
          className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        >
          <ZapIcon className="size-4" />
          <span className="hidden sm:inline">Pro</span>
        </Link>

        <Show when="signed-in">
          <Link href={"/billing"}>
            <Button
              variant={"outline"}
              size={"sm"}
              className="flex items-center gap-2"
            >
              <CreditCardIcon className="size-4" />
              <span className="hidden sm:inline">Billing</span>
            </Button>
          </Link>
        </Show>

        {/* This Button will only be shown if the user is signed in */}
        <UserButton />

        <Show when="signed-in">
          <SignOutButton>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <LogOutIcon className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </SignOutButton>
        </Show>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <LogInIcon className="size-4" />
              <span className="hidden sm:inline">Log in</span>
            </Button>
          </SignInButton>
        </Show>

        <Show when="signed-out">
          <SignUpButton mode="modal">
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <UserPlus2Icon className="size-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </Button>
          </SignUpButton>
        </Show>
      </div>
    </nav>
  );
};

export default NavBar;
