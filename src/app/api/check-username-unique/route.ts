import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

//Query Schema - jab apko kuch check krna ho to jaise object, variable to isko ek syntax hota hai

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {

  //TODO: User this in all other route > Remove it coz nextjs handle it automatically.
  // if (request.method !== 'GET') {
  //   return Response.json(
  //     {
  //       success: false,
  //       message: 'Method not allowed',
  //     },
  //     { status: 405 });
  // }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    //Validate with Zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result); //TODO: remove
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const username = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 });
    }
    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      }, 
      { status: 400 });

  } catch (error) {
    console.log("Error Checking Username", error);
    return Response.json(
      {
        success: false,
        message: "Error Checking username",
      },
      { status: 500 }
    );
  }
}
