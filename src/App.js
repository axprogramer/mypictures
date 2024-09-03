import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import Dropzone from 'react-dropzone';
// import { Cloudinary } from 'cloudinary-core';
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Button,
  Alert,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  CloseButton,
  FormCheck
} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  const [files, setFiles] = useState([]);
  const [filesView, setFilesView] = useState('');
  const [percent, setpercent] = useState('');
  const [completeAct, setcompleteAct] = useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false); // State for tooltip visibility
  const [show, setShow] = useState(false);
  const [showError, setShowError] = useState(false);

  const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/mydbdrive/image/upload';
  const uploadPreset = 'data_upload';
  const UploadComponent = () => {

    const handleDrop = acceptedFiles => {

      setFiles(acceptedFiles);
      acceptedFiles.map((file) => {
        const reader = new FileReader();
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        reader.onload = (e) => {
          setFilesView((prevImages) => [...prevImages, { name: file.name, url: e.target.result, exten: fileExtension }]);
        };
        reader.readAsDataURL(file);

        return file;
      })
    };
    const handleUpload = async () => {
      if (files.length === 0) {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 2500);
      } else {
        try {
          const uploadPromises = [];
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            formData.append('folder', 'KISS');

            const onUploadProgress = (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Uploading ${file.name}: ${percentCompleted}%`);
              setpercent(percentCompleted);
            };

            uploadPromises.push(axios.post(cloudinaryUrl, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress,
            }));
          }

          const uploadedImageUrls = await Promise.all(uploadPromises);
          uploadedImageUrls.map((d, index) => {
            console.log(`File ${index + 1} uploaded successfully. Secure URL: ${d.data.url}`);
            setcompleteAct(true)
            setFiles('')
            setFilesView('')
            setTimeout(() => {
              setpercent('')
              setcompleteAct(false)
            }, 1500);
          })
        } catch (error) {
          console.error('Error uploading files:', error);
        }

      }
    };

    return (
      <div className="text-center">
        <Container>
          <Row>
            <Col>
              <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    <input {...getInputProps()} />
                    <h1 className="fw-bold mt-3 mb-5">Upload Images</h1>
                    <Button className="btn btn-primary btn-sm mb-4 me-3">Select Images</Button>

                  </div>
                )}
              </Dropzone>
            </Col>
          </Row>
          <Button className="btn btn-warning btn-sm text-center mb-4" onClick={handleUpload}>Upload (<span className="fw-bold">{filesView.length} images</span>)</Button>
          {percent ? <ProgressBar variant="success" className="mb-3" now={percent} /> : ''}
          {completeAct && <p>Completed Uploaded!</p>}
          {showError && (
            <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
              <Alert.Heading>Please, select images first!</Alert.Heading>
            </Alert>
          )}

        </Container>
        <Container>
          {filesView ? (
            <>
              <Row>
                {filesView.map((d, index) => {
                  return (
                    <>
                      <Col key={index}>
                        <Card style={{ textAlign: 'center' }}>
                          <Card.Img variant="top" src={d.url} width={'100rem'} />
                          <Card.Body>
                            <Card.Title><Button
                              variant="warning"
                              size="sm"
                            >
                              {index + 1}
                            </Button> {d.name}</Card.Title>
                          </Card.Body>
                          <div className="card-corner-button-container text-end">
                            {/* <OverlayTrigger
                              placement="top"
                              delay={{ show: 50, hide: 5000 }}
                              overlay={<Tooltip>
                                <input/>
                                
                                <CloseButton className="ms-2 btn-danger" onClick={handleClose} /></Tooltip>}
                              onToggle={setShowTooltip}
                            > */}
                            <Button
                              variant="success"
                              size="sm"
                            >
                              {d.exten}
                            </Button>
                            {/* </OverlayTrigger> */}
                          </div>
                        </Card>

                      </Col>
                    </>
                  )
                })}
              </Row>

            </>
          ) : (
            <>
              <h4>Please, select new images!</h4>
            </>
          )}
        </Container>
      </div>
    );
  };

  const CloudinaryImageGallery = ({ cloudName, apiKey, folder }) => {
    const [images, setImages] = useState([]);

    useEffect(() => {
      const fetchImages = async () => {
        try {
          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/folder/`);
          const data = await response.json();
          const imageUrls = data.resources.map(resource => resource.url);
          setImages(imageUrls);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      };

      fetchImages();
    }, [cloudName, folder]); // Dependencies to ensure refetch on changes

    return (
      <div className="image-gallery"> {/* Add a class for styling */}
        {images.map((imageUrl, index) => (
          <AdvancedImage
            key={index}
            cldImg={images.image(imageUrl)
              .format('auto')
              .quality('auto')
              .resize(auto().gravity(autoGravity()).width(500).height(500))} // Apply transformations
          />
        ))}
      </div>
    );
  };

  const CloudinaryGallery = () => {
    const [images, setImages] = useState([]);
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/mydbdrive/resources/image/list";

    useEffect(() => {
      const fetchImages = async () => {
        try {
          const response = await fetch(`${cloudinaryUrl}?prefix=KISS/`);
          const data = await response.json();
          setImages(data.resources);
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      };

      fetchImages();
    }, []);

    return (
      <div className="flex flex-wrap justify-center">
        {images.map((image) => (
          <div key={image.public_id} className="m-2">
            <img
              src={image.secure_url}
              alt={image.public_id}
              className="w-48 h-48 object-cover rounded-lg shadow-lg"
            />
          </div>
        ))}
      </div>
    );
  };  
  return (
    <>
      <UploadComponent />
      <CloudinaryGallery />

    </>
  )
}

export default App;
