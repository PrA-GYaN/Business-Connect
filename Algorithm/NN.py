import numpy as np

class SGD:
    def __init__(self, learning_rate=0.01):
        self.learning_rate = learning_rate

    def update(self, weights, biases, gradients):
        weights += self.learning_rate * gradients['weights']
        biases += self.learning_rate * gradients['biases']

class DenseLayer:
    def __init__(self, num_inputs, num_neurons, optimizer):
        self.weights = np.random.randn(num_inputs, num_neurons) * 0.01  # Normal distribution
        self.biases = np.zeros((1, num_neurons))
        self.optimizer = optimizer

    def activation_function(self, x):
        return np.maximum(0, x)  # ReLU activation

    def derivative_activation_function(self, x):
        return (x > 0).astype(float)  # Derivative of ReLU

    def forward(self, inputs):
        self.inputs = inputs
        self.z = np.dot(inputs, self.weights) + self.biases
        return self.activation_function(self.z)

    def backpropagate(self, output_error):
        derivative = self.derivative_activation_function(self.z)
        delta = output_error * derivative
        
        gradients = {
            'weights': np.dot(self.inputs.T, delta),
            'biases': np.sum(delta, axis=0, keepdims=True)
        }

        self.optimizer.update(self.weights, self.biases, gradients)

        return np.dot(delta, self.weights.T)

class SimpleNeuralNetwork:
    def __init__(self, input_size, hidden_size1, hidden_size2, output_size, learning_rate):
        self.optimizer = SGD(learning_rate)
        self.hidden_layer1 = DenseLayer(input_size, hidden_size1, self.optimizer)
        self.hidden_layer2 = DenseLayer(hidden_size1, hidden_size2, self.optimizer)
        self.output_layer = DenseLayer(hidden_size2, output_size, self.optimizer)

    def forward(self, inputs):
        hidden_output1 = self.hidden_layer1.forward(inputs)
        hidden_output2 = self.hidden_layer2.forward(hidden_output1)
        final_output = self.output_layer.forward(hidden_output2)
        return final_output

    def train(self, inputs, targets, epochs=1000):
        for _ in range(epochs):
            output = self.forward(inputs)
            output_error = targets - output
            
            # Backpropagation from output layer to hidden layers
            output_error = self.output_layer.backpropagate(output_error)
            output_error = self.hidden_layer2.backpropagate(output_error)
            self.hidden_layer1.backpropagate(output_error)

def create_sample_data(num_users=10, num_items=5):
    np.random.seed(42)
    user_item_pairs = []
    ratings = []
    
    for user in range(num_users):
        for item in range(num_items):
            user_item_pairs.append([user, item])
            ratings.append(np.random.randint(1, 6))
    
    return np.array(user_item_pairs), np.array(ratings).reshape(-1, 1)

# Generate sample data
X, y = create_sample_data()

# Scale inputs
X = X / np.max(X)  # Normalize inputs to [0, 1]

# Create a simple neural network with 64 and 128 neurons
input_size = 2  # User and Item
hidden_size1 = 64  # First hidden layer
hidden_size2 = 128  # Second hidden layer
output_size = 1  # Rating prediction
learning_rate = 0.01  # Learning rate

nn = SimpleNeuralNetwork(input_size, hidden_size1, hidden_size2, output_size, learning_rate)

# Train the neural network
nn.train(X, y, epochs=10000)

# Test the neural network with unseen user-item pairs
test_pairs = np.array([[0, 0], [1, 1], [2, 2], [3, 3], [9, 4]])
test_pairs = test_pairs / np.max(X)  # Normalize test pairs

predicted_ratings = nn.forward(test_pairs)

# Display predictions
for pair, rating in zip(test_pairs, predicted_ratings):
    print(f"Predicted Rating for User {pair[0]}, Item {pair[1]}: {rating[0]:.2f}")