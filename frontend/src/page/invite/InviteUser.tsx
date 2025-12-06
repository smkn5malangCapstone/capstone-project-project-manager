import { Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import useAuth from "@/hooks/api/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const InviteUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const param = useParams();
  const inviteCode = param.inviteCode as string;

  const { data: authData, isPending } = useAuth();
  const user = authData?.user;

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
  });

  const returnUrl = encodeURIComponent(
    `${BASE_ROUTE.INVITE_URL.replace(":inviteCode", inviteCode)}`
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    mutate(inviteCode, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });
        navigate(`/workspace/${data.workspaceId}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          SMKN 5 MALANA.
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Hai! Anda diundang untuk bergabung dengan SMKN 5 MALANG!
              </CardTitle>
              <CardDescription>
                  Sepertinya Kamu perlu masuk ke akun SMKN 5 Malang Kamu untuk
                  bergabung dengan Workspace ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <Loader className="!w-11 !h-11 animate-spin place-self-center flex" />
              ) : (
                <div>
                  {user ? (
                    <div className="flex items-center justify-center my-3">
                      <form onSubmit={handleSubmit}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="!bg-green-500 !text-white text-[23px] !h-auto"
                        >
                          {isLoading && (
                            <Loader className="!w-6 !h-6 animate-spin" />
                          )}
                          Gabung Sekarang!
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <Link
                        className="flex-1 w-full text-base"
                        to={`/sign-up?returnUrl=${returnUrl}`}
                      >
                        <Button className="w-full">Daftar</Button>
                      </Link>
                      <Link
                        className="flex-1 w-full text-base"
                        to={`/?returnUrl=${returnUrl}`}
                      >
                        <Button variant="secondary" className="w-full border">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InviteUser;
