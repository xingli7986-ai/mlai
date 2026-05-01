"use client";

import { useRouter } from "next/navigation";
import { Button, Modal } from "@/components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * The path the user should land on after logging in. Defaults to the
   * current pathname when undefined.
   */
  redirect?: string;
  /**
   * Customize the prompt copy. Defaults to a generic 需要登录 message.
   */
  title?: string;
  description?: string;
}

/**
 * Per PRD §6.2, several actions (favorite, like, comment, group buy, custom)
 * require a logged-in consumer. This modal is the standard interception
 * surface — call setOpen(true) on a 401 response to invite the user to
 * log in without leaving the current page until they choose.
 */
export default function LoginModal({
  open,
  onClose,
  redirect,
  title = "需要登录",
  description = "登录后即可继续操作。我们仅使用手机号验证身份。",
}: Props) {
  const router = useRouter();

  const goLogin = () => {
    const target =
      redirect ??
      (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
    router.push(`/login?redirect=${encodeURIComponent(target)}`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>稍后再说</Button>
          <Button variant="primary" onClick={goLogin}>立即登录</Button>
        </>
      }
    >
      {description}
    </Modal>
  );
}
