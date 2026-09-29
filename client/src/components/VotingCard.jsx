export const VotingCard = ({ player, onClick }) => {
  const { username } = player;
  return (
    <div onClick={onClick}>
      <span>{username}</span>
    </div>
  );
};
