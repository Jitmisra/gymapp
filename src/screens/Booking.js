import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const timeSlots = [
  { id: '1', time: '06:00 AM', available: true },
  { id: '2', time: '06:30 AM', available: true },
  { id: '3', time: '07:00 AM', available: true },
  { id: '4', time: '07:30 AM', available: false },
  { id: '5', time: '08:00 AM', available: false },
  { id: '6', time: '08:30 AM', available: true },
  { id: '7', time: '09:00 AM', available: true },
  { id: '8', time: '09:30 AM', available: true },
  { id: '9', time: '10:00 AM', available: false },
  { id: '10', time: '10:30 AM', available: true },
  { id: '11', time: '11:00 AM', available: true },
  { id: '12', time: '11:30 AM', available: true },
];

const equipment = [
  { id: '1', name: 'Treadmill', total: 10, available: 7, icon: 'treadmill' },
  { id: '2', name: 'Bench Press', total: 4, available: 2, icon: 'weight-lifter' },
  { id: '3', name: 'Squat Rack', total: 3, available: 0, icon: 'weight' },
  { id: '4', name: 'Dumbbells', total: 20, available: 15, icon: 'dumbbell' },
  { id: '5', name: 'Exercise Bike', total: 8, available: 5, icon: 'bike' },
  { id: '6', name: 'Smith Machine', total: 2, available: 1, icon: 'weight-lifter' },
];

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedGym, setSelectedGym] = useState('main');

  const getDateString = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const dateButtons = () => {
    const buttons = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const isToday = i === 0;
      
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dateButton,
            selectedDate.getDate() === date.getDate() ? styles.selectedDate : null,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          {isToday && <View style={styles.todayIndicator}/>}
          <Text
            style={[
              styles.dayText,
              selectedDate.getDate() === date.getDate() ? styles.selectedDateText : null,
            ]}
          >
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </Text>
          <Text
            style={[
              styles.dateText,
              selectedDate.getDate() === date.getDate() ? styles.selectedDateText : null,
            ]}
          >
            {date.getDate()}
          </Text>
          {isToday && (
            <Text style={styles.todayText}>Today</Text>
          )}
        </TouchableOpacity>
      );
    }
    return buttons;
  };

  const toggleEquipmentSelection = (id) => {
    if (selectedEquipment.includes(id)) {
      setSelectedEquipment(selectedEquipment.filter(item => item !== id));
    } else {
      setSelectedEquipment([...selectedEquipment, id]);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Gym Session</Text>
        <Text style={styles.headerSubtitle}>Reserve your spot and equipment</Text>
      </View>

      {/* Gym Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Gym</Text>
        <View style={styles.gymSelector}>
          <TouchableOpacity 
            style={[styles.gymOption, selectedGym === 'main' && styles.selectedGym]}
            onPress={() => setSelectedGym('main')}
          >
            <View style={styles.gymImageContainer}>
              <Image 
                source={{uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'}} 
                style={styles.gymImage} 
              />
              {selectedGym === 'main' && (
                <View style={styles.selectedGymOverlay}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
              )}
            </View>
            <Text style={[styles.gymName, selectedGym === 'main' && styles.selectedGymText]}>
              Main Campus Gym
            </Text>
            <View style={styles.gymStatusBadge}>
              <View style={[styles.statusDot, {backgroundColor: '#6BBF59'}]} />
              <Text style={styles.gymStatusText}>Low Traffic</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gymOption, selectedGym === 'north' && styles.selectedGym]} 
            onPress={() => setSelectedGym('north')}
          >
            <View style={styles.gymImageContainer}>
              <Image 
                source={{uri: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f'}} 
                style={styles.gymImage} 
              />
              {selectedGym === 'north' && (
                <View style={styles.selectedGymOverlay}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
              )}
            </View>
            <Text style={[styles.gymName, selectedGym === 'north' && styles.selectedGymText]}>
              North Hall Gym
            </Text>
            <View style={styles.gymStatusBadge}>
              <View style={[styles.statusDot, {backgroundColor: '#FF9B42'}]} />
              <Text style={styles.gymStatusText}>Moderate</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.dateScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>{dateButtons()}</View>
          </ScrollView>
        </View>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.availabilityIndicators}>
            <View style={styles.availabilityItem}>
              <View style={[styles.availabilityDot, {backgroundColor: '#EAECFB'}]} />
              <Text style={styles.availabilityText}>Available</Text>
            </View>
            <View style={styles.availabilityItem}>
              <View style={[styles.availabilityDot, {backgroundColor: '#E5E5E5'}]} />
              <Text style={styles.availabilityText}>Booked</Text>
            </View>
          </View>
        </View>
        <View style={styles.timeContainer}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                !slot.available && styles.unavailableSlot,
                selectedTime === slot.id && styles.selectedTimeSlot,
              ]}
              disabled={!slot.available}
              onPress={() => setSelectedTime(slot.id)}
            >
              <Text
                style={[
                  styles.timeText,
                  !slot.available && styles.unavailableTimeText,
                  selectedTime === slot.id && styles.selectedTimeText,
                ]}
              >
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Duration Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Duration</Text>
        <View style={styles.durationContainer}>
          {['30 min', '45 min', '60 min', '90 min'].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.selectedDuration,
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === duration && styles.selectedDurationText,
                ]}
              >
                {duration}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Equipment Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reserve Equipment (Optional)</Text>
        <View style={styles.equipmentList}>
          {equipment.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.equipmentItem,
                selectedEquipment.includes(item.id) && styles.selectedEquipment,
                item.available === 0 && styles.unavailableEquipment,
              ]}
              disabled={item.available === 0}
              onPress={() => toggleEquipmentSelection(item.id)}
            >
              <View style={styles.equipmentIcon}>
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={22} 
                  color={selectedEquipment.includes(item.id) ? "#fff" : "#666"} 
                />
              </View>
              <View style={styles.equipmentDetails}>
                <Text
                  style={[
                    styles.equipmentName,
                    selectedEquipment.includes(item.id) && styles.selectedEquipmentText,
                    item.available === 0 && styles.unavailableEquipmentText,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.availabilityText,
                    selectedEquipment.includes(item.id) && styles.selectedEquipmentText,
                    item.available === 0 && styles.unavailableEquipmentText,
                  ]}
                >
                  {item.available}/{item.total} available
                </Text>
              </View>
              {selectedEquipment.includes(item.id) && (
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Booking Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
        </View>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gym:</Text>
            <Text style={styles.summaryValue}>
              {selectedGym === 'main' ? 'Main Campus Gym' : 'North Hall Gym'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>
              {selectedTime ? timeSlots.find(slot => slot.id === selectedTime).time : 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{selectedDuration}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Equipment:</Text>
            <Text style={styles.summaryValue}>
              {selectedEquipment.length > 0 
                ? selectedEquipment.map(id => equipment.find(e => e.id === id).name).join(', ') 
                : 'None selected'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Confirm Button */}
      <TouchableOpacity 
        style={styles.bookButton}
        disabled={!selectedTime}
      >
        <Text style={styles.bookButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
      
      {/* Cancellation Policy */}
      <Text style={styles.cancellationText}>
        Free cancellation available up to 2 hours before your booking time.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  section: {
    marginTop: 15,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  // Gym Selection
  gymSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gymOption: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  selectedGym: {
    borderColor: '#4A6FFF',
    backgroundColor: '#EAECFB',
  },
  gymImageContainer: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  gymImage: {
    width: '100%',
    height: '100%',
  },
  selectedGymOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 111, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  selectedGymText: {
    color: '#4A6FFF',
  },
  gymStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  gymStatusText: {
    fontSize: 11,
    color: '#666',
  },
  // Date Selection
  dateScroll: {
    marginBottom: 0,
  },
  datesContainer: {
    flexDirection: 'row',
    paddingBottom: 5,
  },
  dateButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
    paddingTop: 5,
  },
  todayIndicator: {
    position: 'absolute',
    top: 0,
    width: '30%',
    height: 3,
    backgroundColor: '#4A6FFF',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  selectedDate: {
    backgroundColor: '#4A6FFF',
    borderColor: '#4A6FFF',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  todayText: {
    fontSize: 10,
    color: '#4A6FFF',
    marginTop: 2,
  },
  selectedDateText: {
    color: '#fff',
  },
  // Time Selection
  availabilityIndicators: {
    flexDirection: 'row',
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  availabilityText: {
    fontSize: 12,
    color: '#888',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '31%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#EAECFB',
    marginBottom: 12,
  },
  unavailableSlot: {
    backgroundColor: '#F5F5F5',
  },
  selectedTimeSlot: {
    backgroundColor: '#4A6FFF',
  },
  timeText: {
    color: '#333',
    fontWeight: '500',
  },
  unavailableTimeText: {
    color: '#AAA',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Duration Selection
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  durationButton: {
    width: '23%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#EAECFB',
    marginBottom: 10,
  },
  selectedDuration: {
    backgroundColor: '#4A6FFF',
  },
  durationText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 13,
  },
  selectedDurationText: {
    color: '#fff',
  },
  // Equipment Selection
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  equipmentItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EAECFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedEquipment: {
    backgroundColor: '#4A6FFF',
  },
  equipmentDetails: {
    flex: 1,
  },
  unavailableEquipment: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  equipmentName: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  selectedEquipmentText: {
    color: '#fff',
  },
  unavailableEquipmentText: {
    color: '#AAA',
  },
  // Booking Summary
  summarySection: {
    marginTop: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryHeader: {
    padding: 15,
    backgroundColor: '#4A6FFF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryContent: {
    padding: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#4A6FFF',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancellationText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginBottom: 30,
    marginHorizontal: 15,
  }
});

export default Booking;
