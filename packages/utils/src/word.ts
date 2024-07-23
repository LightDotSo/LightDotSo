export const camelCaseToCapitalizedWords = (input: string): string => {
  // Split the string at each point where a lowercase letter is followed by an uppercase letter
  const words = input.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and make sure the rest of the letters are lowercase
  const capitalizedWords = words.map(
    word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );

  // Join the words back into a single string with spaces
  return capitalizedWords.join(" ");
};
