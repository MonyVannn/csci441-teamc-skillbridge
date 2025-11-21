/**
 * Test script to manually test user deletion
 * Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/test-delete-user.ts <clerkId>
 *
 * Example: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/test-delete-user.ts user_2abc123def
 */

import { deleteUser } from "../lib/actions/user";

async function testDeleteUser() {
  const clerkId = process.argv[2];

  if (!clerkId) {
    console.error("❌ Please provide a clerkId as an argument");
    console.log(
      'Usage: npx ts-node --compiler-options \'{"module":"commonjs"}\' scripts/test-delete-user.ts <clerkId>'
    );
    process.exit(1);
  }

  console.log(`\n🧪 Testing user deletion for clerkId: ${clerkId}\n`);

  try {
    const result = await deleteUser(clerkId);
    console.log("\n✅ Deletion completed successfully!");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Deletion failed!");
    console.error("Error:", error);
    process.exit(1);
  }
}

testDeleteUser();
