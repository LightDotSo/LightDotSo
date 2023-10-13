// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Separator } from "@lightdotso/ui";
import { ProfileForm } from "@/app/(authenticated)/settings/profile-form";
import { SettingsSection } from "@/app/(authenticated)/settings/section";

export default function SettingsProfilePage() {
  return (
    <SettingsSection
      title="Account"
      description="Update your account settings. Set your preferred language and
          timezone."
    >
      <Separator />
      <ProfileForm />
    </SettingsSection>
  );
}
