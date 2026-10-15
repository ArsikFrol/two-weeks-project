'use client'

import { useState } from "react";

import { useEditProfile } from "@/store/EditProfile/editProfile";
import { Edit } from "./Edit/Edit";
import { EditProfile } from "@/store/EditProfile/types";
import { Card } from "../UI/Card";

export function ProfileEditing() {

    const { editProfile, setEditProfile } = useEditProfile()

    const [obj, setObj] = useState<EditProfile>({
        age: editProfile.age,
        description: editProfile.description,
        name: editProfile.name,
        userName: editProfile.userName,
        photoProfile: editProfile.photoProfile
    })

    return (
        <div className="flex justify-center items-center gap-x-[50px] bg-[rgba(164,188,188,1)] w-full h-[calc(100vh-77px)]">
            <Card obj={obj} />
            <Edit obj={obj} setObj={setObj} setEditProfile={setEditProfile} editProfileState={editProfile} />
        </div>
    )
}