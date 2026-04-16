"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Save, X } from "lucide-react";
import { Socials, UserModel } from "@/types/users.types";
import { BUCKET } from "@/utils/bucket";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function extractStoragePath(publicUrl: string, bucket: string): string | null { //HELPERS
  try {
    const marker = `/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export default function ProfileEditForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState<UserModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [instrument, setInstrument] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [departedAt, setDepartedAt] = useState("");
  const [socials, setSocials] = useState<Socials>({});

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        console.error("Failed to fetch profile:", error?.message);
        setError("Failed to load profile.");
        return;
      }

      setProfile(data);
      setFullName(data.full_name ?? "");
      setBio(data.bio ?? "");
      setInstrument(data.instrument ?? "");
      setJoinedAt(data.joined_at ?? "");
      setDepartedAt(data.departed_at ?? "");
      setSocials(data.socials ?? {});
    }

    fetchProfile();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WEBP, or GIF images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearSelectedImage() {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImage(file: File, userId: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `profiles/avatar-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      setError(`Failed to upload image: ${error.message}`);
      return "";
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function deleteOldImage(oldUrl: string) {
    const path = extractStoragePath(oldUrl, BUCKET);
    if (!path) return;

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
        setError(`Failed to delete old image: ${error.message}`);
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    startTransition(async () => {
      try {
        let newProfilePath = profile.profile_path;

        if (selectedFile) {
          setIsUploadingImage(true);

          if (profile.profile_path) {
            await deleteOldImage(profile.profile_path);
          }

          newProfilePath = await uploadImage(selectedFile, profile.id);
          setIsUploadingImage(false);
        }

        const { error } = await supabase
          .from("users")
          .update({
            full_name: fullName || null,
            bio: bio || null,
            instrument: instrument || null,
            joined_at: joinedAt || null,
            departed_at: departedAt || null,
            socials,
            profile_path: newProfilePath,
          })
          .eq("id", profile.id);

        if (error) throw new Error(error.message);
      } catch (err: unknown) {
        setIsUploadingImage(false);
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        console.error("Profile update failed:", msg);
        setError(msg);
      }
    });
  }

  const isLoading = isPending || isUploadingImage;
  const currentPhotoUrl = previewUrl ?? profile?.profile_path;

  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
                {currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    alt="Profile photo"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground">
                    {(fullName || profile.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-muted"
                title="Change photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                Change photo
              </Button>
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedImage}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Remove selection
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WEBP or GIF · max {MAX_FILE_SIZE_MB}MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Basic Info
            </h2>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio about yourself"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrument">Instrument</Label>
              <Input
                id="instrument"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="e.g. Guitar, Drums, Vocals"
                disabled={isLoading}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Membership
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joined_at">Joined</Label>
                <Input
                  id="joined_at"
                  type="date"
                  value={joinedAt}
                  onChange={(e) => setJoinedAt(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departed_at">Departed</Label>
                <Input
                  id="departed_at"
                  type="date"
                  value={departedAt}
                  onChange={(e) => setDepartedAt(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Socials
            </h2>

            {(["facebook", "instagram", "tiktok", "youtube", "spotify", "twitter"] as const).map(
              (platform) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={platform} className="capitalize">
                    {platform}
                  </Label>
                  <Input
                    id={platform}
                    value={socials[platform] ?? ""}
                    onChange={(e) =>
                      setSocials((prev) => ({ ...prev, [platform]: e.target.value }))
                    }
                    placeholder={`https://${platform}.com/yourprofile`}
                    disabled={isLoading}
                  />
                </div>
              )
            )}
          </section>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? "Uploading…" : "Saving…"}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}