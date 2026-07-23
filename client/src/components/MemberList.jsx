function MemberList({ group, onlineDeviceIds }) {
  if (!group) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      background: 'white',
      padding: '10px 14px',
      borderRadius: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      zIndex: 1000,
      minWidth: 160,
    }}>
      <strong>{group.name}</strong>
      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
        {group.members.map((member) => (
          <li key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: onlineDeviceIds.has(member._id) ? 'limegreen' : 'lightgray',
                display: 'inline-block',
              }}
            />
            {member.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MemberList;