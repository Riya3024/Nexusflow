export default function UserProfile() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) return null;

  return (
    <div
      style={{
        background:"#0D1526",
        padding:15,
        borderRadius:10,
        color:"white"
      }}
    >
      <h3>
        👤 {user.name}
      </h3>

      <p>
        ID: {user.id}
      </p>

      <p>
        {user.email}
      </p>
    </div>
  );
}