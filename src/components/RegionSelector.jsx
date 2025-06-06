import React, { useState, useEffect } from "react"
import { Modal, Button, Form } from "react-bootstrap"
import { medusaClient } from "../utils/client"

const regions = [
    { code: "us", label: "🇺🇸 United States" },
    { code: "ca", label: "🇨🇦 Canada" },
    { code: "ng", label: "🇳🇬 Nigeria" },
    { code: "ml", label: "🇲🇱 Mali" },
    { code: "sn", label: "🇸🇳 Senegal" },
    { code: "ci", label: "🇨🇮 Ivory Coast" },
]

const RegionSelector = ({ onRegionSelect }) => {
    const [show, setShow] = useState(true)
    const [selectedRegion, setSelectedRegion] = useState("");
    const [regionsMedusa, setRegionsMedusa] = useState([]);


    useEffect(() => {
        const getRegions = async () => {
            const tempRegions = await medusaClient.store.region.list();
            setRegionsMedusa(tempRegions.regions);
        }
        getRegions();
    }, []);

    
    const handleSave = () => {
        if (selectedRegion) {
            onRegionSelect(selectedRegion)
            
            setShow(false)
        }
    }

    return (
        <Modal
            show={show}
            backdrop="static"
            keyboard={false}
            centered
            size="md"
            aria-labelledby="region-selector-modal"
        >
            <Modal.Header className="border-0">
                <Modal.Title id="region-selector-modal" className="fw-bold fs-4">
                    Select Your Region
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="regionSelect" className="mb-3">
                        <Form.Label className="fs-6 text-muted">
                            Please choose your region to personalize your experience:
                        </Form.Label>
                        <Form.Select
                            aria-label="Select region"
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="py-2"
                        >
                            <option value="">-- Select Region --</option>
                            {regionsMedusa.map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.name}
                                </option>
                            ))}

                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!selectedRegion}
                    className="px-4 py-2 fw-semibold"
                >
                    Continue
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default RegionSelector
