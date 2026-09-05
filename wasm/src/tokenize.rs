pub fn stop_words() -> &'static [&'static str] {
    &[
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
        "from", "as", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had",
        "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can",
        "need", "dare", "ought", "used", "this", "that", "these", "those", "i", "we", "you",
        "they", "he", "she", "it", "my", "our", "your", "his", "her", "its", "their", "me", "us",
        "him", "them", "about", "into", "over", "after", "before", "between", "under", "above",
        "below", "out", "off", "up", "down", "just", "also", "very", "too", "really", "quite",
        "some", "any", "each", "every", "both", "few", "more", "most", "other", "such", "only",
        "own", "same", "than", "then", "now", "here", "there", "when", "where", "why", "how",
        "all", "who", "whom", "which", "what", "if", "while", "because", "although", "since",
        "until", "once", "so", "than", "whether", "no", "not", "nor", "none", "nothing", "neither",
        "nobody", "never",
    ]
}

pub fn is_stop_word(word: &str) -> bool {
    stop_words().contains(&word)
}

pub fn tokenize(text: &str) -> Vec<String> {
    let lower = text.to_lowercase();
    let cleaned: String = lower
        .chars()
        .map(|c| {
            if c.is_alphanumeric()
                || c == '-'
                || c == '/'
                || c == '+'
                || c == '#'
                || c == '.'
                || c == ' '
            {
                c
            } else {
                ' '
            }
        })
        .collect();

    cleaned
        .split_whitespace()
        .filter(|w| w.len() >= 2 && !is_stop_word(w))
        .map(|w| w.to_string())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stop_word_detection() {
        assert!(is_stop_word("the"));
        assert!(is_stop_word("and"));
        assert!(!is_stop_word("python"));
    }

    #[test]
    fn test_tokenize_filters_stop_words() {
        let tokens = tokenize("the python and docker developer");
        assert!(tokens.contains(&"python".to_string()));
        assert!(tokens.contains(&"docker".to_string()));
        assert!(!tokens.contains(&"the".to_string()));
        assert!(!tokens.contains(&"and".to_string()));
    }

    #[test]
    fn test_tokenize_short_words_filtered() {
        let tokens = tokenize("a I to at");
        assert!(tokens.is_empty());
    }

    #[test]
    fn test_tokenize_strips_special_chars() {
        let tokens = tokenize("hello! @world $dollar%");
        assert!(tokens.contains(&"hello".to_string()));
        assert!(tokens.contains(&"world".to_string()));
        assert!(tokens.contains(&"dollar".to_string()));
    }
}
