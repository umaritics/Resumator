// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useRouter } from "next/navigation";

// const AuthPage = () => {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // login / signup handler
//   const handleAuth = async (
//     e: React.FormEvent<HTMLFormElement>,
//     type: "login" | "signup"
//   ) => {
//     e.preventDefault();
//     setLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;

//     if (type === "login") {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (error) alert(error.message);
//       else router.push("/"); // go back to landing page
//     } else {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//       });
//       if (error) alert(error.message);
//       else router.push("/");
//     }

//     setLoading(false);
//   };

//   // google auth
//   const handleGoogle = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//     });
//     if (error) alert(error.message);
//   };

//   return (
//     <div
//       className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
//       style={{ backgroundImage: "url('/bg-auth.png')" }}
//     >
//       {/* Overlay to dim background */}
//       <div className="absolute inset-0" />

//       {/* Auth Card */}
//       <Card className="relative z-10 w-full max-w-md border-blue-600 border-2 shadow-xl">
//         <CardHeader>
//           <CardTitle className="text-center text-blue-600 text-2xl font-bold">
//             Resumator
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {/* Google Login */}
//           <Button
//             type="button"
//             onClick={handleGoogle}
//             className="w-full bg-red-500 hover:bg-red-600 text-white mb-5"
//           >
//             Sign in with Google
//           </Button>

//           {/* Tabs for Login / Signup */}
//           <Tabs defaultValue="login" className="w-full">
//             <TabsList className="grid w-full grid-cols-2 bg-blue-100">
//               <TabsTrigger
//                 value="login"
//                 className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
//               >
//                 Login
//               </TabsTrigger>
//               <TabsTrigger
//                 value="signup"
//                 className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
//               >
//                 Sign Up
//               </TabsTrigger>
//             </TabsList>

//             {/* Login Form */}
//             <TabsContent value="login">
//               <form
//                 onSubmit={(e) => handleAuth(e, "login")}
//                 className="space-y-4 mt-4"
//               >
//                 <div>
//                   <Label htmlFor="email" className="text-blue-600">
//                     Email
//                   </Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="password" className="text-blue-600">
//                     Password
//                   </Label>
//                   <Input
//                     id="password"
//                     name="password"
//                     type="password"
//                     placeholder="••••••••"
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//                   disabled={loading}
//                 >
//                   {loading ? "Logging in..." : "Login"}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* Signup Form */}
//             <TabsContent value="signup">
//               <form
//                 onSubmit={(e) => handleAuth(e, "signup")}
//                 className="space-y-4 mt-4"
//               >
//                 <div>
//                   <Label htmlFor="email" className="text-blue-600">
//                     Email
//                   </Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="password" className="text-blue-600">
//                     Password
//                   </Label>
//                   <Input
//                     id="password"
//                     name="password"
//                     type="password"
//                     placeholder="••••••••"
//                     required
//                   />
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//                   disabled={loading}
//                 >
//                   {loading ? "Signing up..." : "Sign Up"}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
// export default AuthPage;
