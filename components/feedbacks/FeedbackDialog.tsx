import * as React from "react";
import { View, TextInput } from "react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SSText } from "@/components/ui/SSText";
import SSSpinner from "@/components/ui/SSSpinner";
import { useFeedbackNudgeStore } from "@/store/useFeedbackNudgeStore"; // optional; remove if not using
import { postAppFeedback } from "@/endpoints/app-feedbacks/endpoints";
import { Input } from "../ui/input";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showNeverAskAgain?: boolean;
};

export default function FeedbackDialog({ open, onOpenChange, showNeverAskAgain = true }: Props) {
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dismissOnce = useFeedbackNudgeStore((s) => s.dismissOnce);
  const setNeverAskAgain = useFeedbackNudgeStore((s) => s.setNeverAskAgain);

  const minLen = 3;
  const canSubmit = notes.trim().length >= minLen && !submitting;

  const close = React.useCallback(() => {
    // reset state on close
    setNotes("");
    setSubmitting(false);
    setSent(false);
    setError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const user = useAuth().user;
  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setError(null);
      await postAppFeedback({ notes: notes.trim() });
      setSent(true);
      // optional: mark the nudge as handled for this session
      dismissOnce?.();
      // small delay so the success state is visible before closing
      setTimeout(close, 2000);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotNow = () => {
    dismissOnce?.();
    close();
  };

  const handleNeverAskAgain = () => {
    setNeverAskAgain?.();
    close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92%] max-w-md rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>
            <SSText className="text-center font-semibold !text-lg">
              Got 10 seconds for feedback?
            </SSText>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <View className="px-5 pb-4">
          {submitting ? (
            <>
              <SSText className="text-center mt-1">Sending your feedback…</SSText>
              <SSText className="text-center text-xs text-gray-500 mt-1">
                Thanks for helping us improve SweetSpots.
              </SSText>
              <SSSpinner className="mt-4 self-center" />
            </>
          ) : sent ? (
            <>
              <SSText className="text-center font-bold text-lg mt-1">Feedback received 🎉</SSText>
              <SSText className="text-center text-xs text-gray-500 mt-1">
                We appreciate you!
              </SSText>
            </>
          ) : (
            <>
              <SSText className="text-center text-sm text-gray-500">
                Tell us what worked or what we should improve.
              </SSText>

              <View className="mt-3">
                <Input
                  placeholder="e.g., Recommend more ‘Nature’ vibes around Mornington…"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={5}
                  className="min-h-28 rounded-xl border border-gray-200 px-3 py-2 text-base"
                  textAlignVertical="top"
                />
                <View className="mt-2 flex-row justify-between">
                  <SSText className="text-xs text-gray-400">{notes.trim().length}/{Math.max(80, notes.trim().length)}</SSText>
                  <SSText className={`text-xs ${notes.trim().length < minLen ? "text-red-400" : "text-gray-400"}`}>
                    {notes.trim().length < minLen ? `Min ${minLen} chars` : "Looks good"}
                  </SSText>
                </View>
                {error && (
                  <SSText className="text-xs text-red-500 mt-2 text-center">{error}</SSText>
                )}
              </View>
            </>
          )}
        </View>

        {/* Footer buttons */}
        {!submitting && !sent && (
          <View className="px-5 pb-5 gap-2">
            <Button
              className="w-full"
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
                <SSText>
              Send feedback
                </SSText>
            </Button>

            <View className="flex-row gap-2">
              <Button
                variant="outline"
                onPress={handleNotNow}
                className="flex-1"
              >
                <SSText>
                Not now
                </SSText>
              </Button>
              {showNeverAskAgain && (
                <Button
                  variant="ghost"
                  onPress={handleNeverAskAgain}
                >
                    <SSText>
                  Don't ask again
                    </SSText>
                </Button>
              )}
            </View>
          </View>
        )}

        {sent && (
          <View className="px-5 pb-5">
            <Button className="w-full rounded-xl" onPress={close}>
                <SSText>
              Close
                </SSText>
            </Button>
          </View>
        )}
      </DialogContent>
    </Dialog>
  );
}