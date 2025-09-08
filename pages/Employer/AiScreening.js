import React, { useState, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ScreeningQuestionsModal = ({ visible, onClose, onSubmit }) => {
  const [questions, setQuestions] = useState([{ question: "", correctAnswer: "" }]);
  const inputRefs = useRef({});

  // ---- Supporting functions ----
  const addQuestion = () => {
    if (questions.length < 3) {
      setQuestions([...questions, { question: "", correctAnswer: "" }]);
    }
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    // Validate all filled properly
    const incomplete = questions.some(
      (q) => q.question.trim() === "" || q.correctAnswer === ""
    );
    if (incomplete) {
      alert("Please complete all questions before submitting");
      return;
    }
    onSubmit(questions);
    onClose();
  };

  // ---- Modal UI ----
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Screening Questions (Optional)</Text>
          <Text style={styles.modalSubtitle}>
            Add up to 3 questions with Yes/No answers
          </Text>

          <ScrollView>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                {/* Header */}
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>
                    Question {index + 1}
                  </Text>
                  {questions.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeQuestion(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#BE4145" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Input */}
                <TextInput
                  ref={(ref) => (inputRefs.current[`question_${index}`] = ref)}
                  value={question.question}
                  onChangeText={(text) =>
                    updateQuestion(index, "question", text)
                  }
                  placeholder="Enter your question"
                  style={styles.input}
                  placeholderTextColor="#666666"
                />

                {/* Answer Selector */}
                <View style={styles.answerContainer}>
                  <Text style={styles.answerLabel}>Expected Answer</Text>
                  <View style={styles.answerButtons}>
                    <TouchableOpacity
                      style={[
                        styles.answerButton,
                        question.correctAnswer === "Yes" &&
                          styles.selectedAnswerButton,
                      ]}
                      onPress={() =>
                        updateQuestion(index, "correctAnswer", "Yes")
                      }
                    >
                      <Text
                        style={[
                          styles.answerButtonText,
                          question.correctAnswer === "Yes" &&
                            styles.selectedAnswerText,
                        ]}
                      >
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.answerButton,
                        question.correctAnswer === "No" &&
                          styles.selectedAnswerButton,
                      ]}
                      onPress={() =>
                        updateQuestion(index, "correctAnswer", "No")
                      }
                    >
                      <Text
                        style={[
                          styles.answerButtonText,
                          question.correctAnswer === "No" &&
                            styles.selectedAnswerText,
                        ]}
                      >
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {questions.length < 3 && (
              <TouchableOpacity
                style={styles.addQuestionButton}
                onPress={addQuestion}
              >
                <Ionicons name="add-circle-outline" size={20} color="#BE4145" />
                <Text style={styles.addQuestionText}>Add Another Question</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ScreeningQuestionsModal;

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#222",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  questionNumber: { fontSize: 14, fontWeight: "500", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    color: "#333",
  },
  answerContainer: { marginBottom: 6 },
  answerLabel: { fontSize: 13, color: "#444", marginBottom: 4 },
  answerButtons: { flexDirection: "row", gap: 8 },
  answerButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    alignItems: "center",
  },
  selectedAnswerButton: {
    backgroundColor: "#BE4145",
    borderColor: "#BE4145",
  },
  answerButtonText: { fontSize: 14, color: "#333" },
  selectedAnswerText: { color: "#fff", fontWeight: "600" },
  addQuestionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  addQuestionText: { marginLeft: 6, color: "#BE4145", fontSize: 14 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: { color: "#333" },
  submitButton: {
    backgroundColor: "#BE4145",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  submitButtonText: { color: "#fff", fontWeight: "600" },
};
