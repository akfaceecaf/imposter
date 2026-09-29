import { VotingCard } from "./VotingCard";

export const VotingGrid = ({ players, onSelect }) => {
  return (
    <div>
      {players.map((player) => (
        <VotingCard
          key={player.userID}
          player={player}
          onClick={() => onSelect(player)}
        />
      ))}
    </div>
  );
};
